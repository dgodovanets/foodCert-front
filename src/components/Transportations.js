import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { LinearProgress, Grid, Button, Typography } from '@material-ui/core';
import MaterialTable from 'material-table';
import { useState, useEffect } from 'react';
import { getAllTransportationsForUser, generateTransportation, getAllTransportations, deleteTransport } from '../services/data';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import config from '../config/config';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import cfg from '../config/config'
import { useCookies } from 'react-cookie';
import { CsvBuilder } from 'filefy';
dayjs.extend(localizedFormat)
dayjs.extend(utc);

const useStyles = makeStyles((theme) => ({
  profiles: {
    padding: theme.spacing(2),
  },
  generateButton: {
    marginLeft: theme.spacing(3)
  }
}));



export default function Transportations({ authToken, allMode = false }) {
  const classes = useStyles();
  const [cookies] = useCookies();
  const langPack = cfg[cookies.lang ? cookies.lang : 'en'];

  const getTemp = (t) => {
    if (cookies.lang === 'en' || !cookies.lang) {
      return t * 9/5 + 32 + '°F';
    } else {
      return t + '°C';
    }
  }

  const TEMPERATURE_POINT_COLUMNS = [
    {
      title: '_id',
      field: '_id',
      hidden: true,
    },
    {
      title: 'x',
      field: 'x',
    },
    {
      title: 'y',
      field: 'y',
    },
    {
      title: 'z',
      field: 'z',
    },
    {
      title: langPack.temp,
      field: 'temperatureValue',
      render: (tp) => getTemp(tp.temperatureValue)
    },
  ];

  const TEMPERATURE_PROFILE_COLUMNS = [
    {
      title: '_id',
      field: '_id',
      hidden: true,
    },
    {
      title: langPack.date,
      field: 'creationTimestamp',
      render: p =>
        dayjs(p.creationTimestamp)
          .local()
          .format('hh:mm:ss')
          .toString(),
    },
    {
      title: langPack.isValid,
      field: 'isValid',
      render: p => {
        const valid = p.points.some(point => point < p.min || point > p.max);
        return valid ? langPack.valid : langPack.invalid;
      }
    },
  ];

  const TRANSPORTATION_COLUMNS = [
    allMode ? {
      title: langPack.transpEmail,
      field: 'transporterId.email',
    } : {
      title: '_id',
      field: '_id',
      hidden: true,
    }
    ,
    {
      title: langPack.date,
      field: 'transportationEndTime',
      render: p =>
        dayjs(p.updatedAt)
          .local()
          .format('lll'),
    },
    {
      title: langPack.minTempSet,
      field: 'minimalAllowedTemperature',
      render: (tp) => getTemp(tp.minimalAllowedTemperature)
    },
    {
      title: langPack.maxTempSet,
      field: 'maximalAllowedTemperature',
      render: (tp) => getTemp(tp.maximalAllowedTemperature)
    },
    {
      title: langPack.certStatus,
      field: 'certificatePath',
      render: p => {
        if (p.score < 0) {
          return langPack.notCertified;
        }
        if (!p.certificatePath) {
          return;
        }

        const href = `${config.serverBaseURL}/certificate/${p._id.toString()}?authToken=${authToken}`;
        return (
          <a href={href} target="_blank">
            <Button variant="outlined" color="primary" style={{ textDecoration: 'none' }}>
              {langPack.openCert}
            </Button>
          </a>
        );
      }
    },
    {
      title: langPack.score,
      field: 'score',
    },
  ];
  const [transportationData, setTransportationData] = useState([]);
  const [loadingTransportationData, setLoadingTransportationData] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const loadTransportationData = async (setLoading = false) => {
    try {
      if (setLoading) {
        setLoadingTransportationData(true);
      }
      const { transportations } = await (allMode ? getAllTransportations(authToken) : getAllTransportationsForUser(authToken));
      setTransportationData(transportations);
      setDataLoaded(true);
      setLoadingTransportationData(false);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (!dataLoaded) {
      loadTransportationData();
    }
  });

  const handleGenerate = async () => {
    setLoadingTransportationData(true);
    const { transportations } = await generateTransportation(authToken);
    setTransportationData(transportations);
    setLoadingTransportationData(false);
  }

  const byString = (o, s) => {
    if (!s) {
      return;
    }

    s = s.replace(/\[(\w+)\]/g, '.$1');
    s = s.replace(/^\./, '');
    const a = s.split('.');
    for (let i = 0, n = a.length; i < n; ++i) {
      const x = a[i];
      if (o && x in o) {
        o = o[x];
      } else {
        return;
      }
    }
    return o;
  };

  const exportCsv = (columns, dataToExport) => {
    const data = dataToExport.map(rowData => columns.map(columnDef => getFieldValue(rowData, columnDef)));
    const builder = new CsvBuilder(getExportFileName() + '.csv');
    builder
      .setDelimeter(',')
      .setColumns(columns.map(columnDef => columnDef.title))
      .addRows(data)
      .exportFile();
  };

  const getFieldValue = (rowData, columnDef, lookup = true) => {
    let value =
      typeof rowData[columnDef.field] !== 'undefined'
        ? rowData[columnDef.field]
        : byString(rowData, columnDef.field);
    if (columnDef.lookup && lookup) {
      value = columnDef.lookup[value];
    }
    if (Array.isArray(value)) {
      value = value.join(',');
    }
    return value;
  };

  const getExportFileName = () => {
    return (
      new Date().toLocaleDateString('en', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }) + ` - Transports Export`
    );
  };

  const handleDeleteTransport = async (transport) => {
    setLoadingTransportationData(true);
    const { transportations } = await deleteTransport(authToken, transport._id);
    setTransportationData(transportations);
    setLoadingTransportationData(false);
  }
  
  return (
    <React.Fragment>
      {loadingTransportationData && <LinearProgress />}
      <MaterialTable 
        title={
          <>
            <Typography variant="h5">
              {allMode ? langPack.transps : langPack.myTranspTitle}
              {!allMode && 
                <Button variant="outlined" color="primary" onClick={handleGenerate} className={classes.generateButton}>
                  {langPack.genSample}
                </Button>}
            </Typography>
          </>
        }
        columns={TRANSPORTATION_COLUMNS}
        data={transportationData}
        localization={{
          pagination: {
            labelDisplayedRows: langPack.labelDisplayedRows,
            labelRowsSelect: langPack.labelRowsSelect
          },
          toolbar: {
            nRowsSelected: langPack.nRowsSelected,
            searchPlaceholder: langPack.searchPlaceholder
          },
          header: {
            actions: langPack.actions
          },
          body: {
            emptyDataSourceMessage: langPack.emptyDataSourceMessage,
          }
      }}
        options={{
          sorting: true,
          pageSize: 10,
          exportButton: true,
          exportFileName: getExportFileName(),
          exportAllData: true,
          exportCsv: exportCsv,
        }}
        actions={allMode ? [
          {
            icon: 'delete',
            onClick: (event, rowData) => handleDeleteTransport(rowData)
          }
        ] : undefined}
        detailPanel={(t) => {
          return (
            <Grid item className={classes.profiles}>
              <MaterialTable
                title={langPack.tempProfiles}
                options={{
                  sorting: true,
                }}
                columns={TEMPERATURE_PROFILE_COLUMNS}
                data={t.temperatureMaps.map(tmap => { tmap.min = t.minimalAllowedTemperature; return tmap; })
                                       .map(tmap => { tmap.max = t.maximalAllowedTemperature; return tmap; })}
                detailPanel={(tmap => {
                  return (
                    <Grid item className={classes.profiles}>
                      <MaterialTable 
                        title={langPack.tempPoints}
                        options={{
                          sorting: true,
                          pageSize: 10,
                        }}
                        columns={TEMPERATURE_POINT_COLUMNS}
                        data={tmap.points}
                      />
                    </Grid>
                  );
                })}
              />
            </Grid>
          );
        }}
      />
    </React.Fragment>
  );
}
const axios = require('axios')
require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');

const run = () => {
  const Authorization = process.env.Authorization
  //const password = process.env.PASS
  console.log('Traitement en cours ...');
  const datas = [];
  try {
    //Parcour et chargement du fichier CSV dans le tableau datas  
    fs.createReadStream('./fileData/data.csv').pipe(csv()).on('data', (row) => {
      datas.push(row);
      //fin du chargement du fichier
    }).on('end', async () => {
      //parcour du tableau pour correction dans le système
      for (let index = 0; index < datas.length; index++) {
        let result = {};
        const ligne = datas[index];
        //authentification et recuperation de l'objet a corriger
        //axios.get(`${process.env.API_SOURCE}api/trackedEntityInstances/${ligne.tei}/?ou=Ky2CzFdfBuO;odY5MzWb1jc&program=c9m3ufPy8D6&eventStartDate=2022-07-16&eventEndDate=2022-07-30&fields=*&pageSize=2`, {
        axios.get(`${process.env.API_SOURCE}api/trackedEntityInstances/${ligne.tei}.json?program=c9m3ufPy8D6&fields=*`, {
            headers: {
            'Authorization': Authorization,
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            result = response.data;
            //console.log(result.enrollments.length);
            if (result.enrollments.length != 0) {
              if (result.enrollments[0].events.length != 0) {
                if (result.enrollments[0].events.length == 1) {
                  //mise à jour de l'oganisation unit niveau 
                  result.orgUnit = ligne.bonOrganisationUnit;

                  for (let j = 0; j < result.programOwners.length; j++) {
                    result.programOwners[j].ownerOrgUnit = ligne.bonOrganisationUnit;
                  }
                  result.enrollments[0].orgUnit = ligne.bonOrganisationUnit;
                }
                //console.log(result.programOwners[0])
                //mise à jour de l'event saisie dans la periode  
                for (let i = 0; i < result.enrollments[0].events.length; i++) {
                  //console.log(result.enrollments[0].events[i].eventDate.includes('2022-07'));
                  if (result.enrollments[0].events[i].eventDate.includes('2022-07')) {
                    result.enrollments[0].events[i].orgUnit = ligne.bonOrganisationUnit;
                  }
                }
              }
            }
            //console.log(result);
            //envoi de la modification
            axios.post(`${process.env.API_SOURCE}api/trackedEntityInstances`, JSON.stringify(result),
              //(`${process.env.API_SOURCE}api/trackedEntityInstances`, JSON.stringify(result),
              {
                headers: {
                  'Authorization': Authorization,
                  'Content-Type': 'application/json'
                }
              })
              .then(response => {
                console.log(result.trackedEntityInstance + " OK")
                //console.log(response.data)
              })
              .catch(err => {
                console.log(result.trackedEntityInstance + " NOT OK")
                //console.log(err)
              })
          }
          )
          .catch(err => {
            console.log(`Err reading API for ${ligne.tei}`)
            console.log(err);
          });
      }
      //  }
    }
    )
    //console.log('Fin de traitement');
  } catch (error) {
    console.error(error);
  }
}
run();

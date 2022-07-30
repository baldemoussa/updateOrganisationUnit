const axios = require('axios')
require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');

const run = () => {
  const username = process.env.USER
  const password = process.env.PASS
  console.log('Traitement en cours ...');
  const datas = [];
  //Parcour et chargement du fichier CSV dans le tableau datas
  fs.createReadStream('./fileData/data.csv').pipe(csv()).on('data', (row) => {
    datas.push(row);
    //fin du chargement du fichier
  }).on('end', async () => {
    //parcour du tableau pour correction dans le système
    for (let index = 0; index < datas.length; index++) {
      const ligne = datas[index];
      try {
        //authentification et recuperation de l'objet a corriger
        axios.get(`${process.env.API_SOURCE}api/trackedEntityInstances/${ligne.tei}/?ou=Ky2CzFdfBuO;odY5MzWb1jc&program=c9m3ufPy8D6&&eventStartDate=2022-07-16&eventEndDate=2022-07-30&fields=*&pageSize=2`, {
          auth: {
            username: username,
            password: password
          }
        })
          .then(response => {
            const result = response.data;
            if (result.enrollments) {
              if (result.enrollments.events) {
                if (result.enrollments.events.length == 1 & result.orgUnit !== ligne.bonOrganisationUnit) {
                  //mise à jour de l'oganisation unit niveau 
                  result.orgUnit = ligne.bonOrganisationUnit;
                  result.enrollments[0].orgUnit = ligne.bonOrganisationUnit;
                }
                //mise à jour sur la dernière dose saisie              
                result.enrollments.events[result.enrollments.events.length - 1].orgUnit = ligne.bonOrganisationUnit;
              }
            }
            //envoi de la modification
            axios.put(`${process.env.API_SOURCE}api/api/trackedEntityInstances/${ligne.tei}`, JSON.stringify(result),
              {
                auth: {
                  username: username,
                  password: password
                }
              })
              .then(response => {
                console.log(result.trackedEntityInstance + " OK")
                //console.log(response.data)
              })
              .catch(err => {
                console.log(result.trackedEntityInstance + " NOT OK")
                console.log(err)
              })
          }
          )
          .catch(err => {
            console.log(`Err reading API for ${ligne.tei}`)
            console.log(err);
          });
      }
  }
  }
  )
  console.log('Fin de traitement');
}
run();

const axios = require('axios')
require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');

const run = () => {
  const Authorization = process.env.Authorization;
  const serveur = process.env.API_SOURCE_DEV;
  //const serveur = process.env.API_SOURCE_PROD;
  const program_tracker = 'c9m3ufPy8D6'; //UID du program tracker
  const dataElement_maj = 'ToUZeYVF25W'; //UID de l'element de données
  const newValue = 'Non'; //Nouvelle valeur a affecter à l'element de donnée

  //const password = process.env.PASS
  console.log('Traitement en cours ...');
  const datas = [];
  try {
    //Parcour et chargement du fichier CSV dans le tableau datas  
    fs.createReadStream('./fileData/dataCivie.csv').pipe(csv()).on('data', (row) => {
      datas.push(row);
      //fin du chargement du fichier
    }).on('end', async () => {
      //parcour du tableau pour correction dans le système
      for (let index = 0; index < datas.length; index++) {
        let result = {};
        const ligne = datas[index];
        //authentification et recuperation de l'objet a corriger
        //axios.get(`${process.env.API_SOURCE}api/trackedEntityInstances/${ligne.tei}/?ou=Ky2CzFdfBuO;odY5MzWb1jc&program=c9m3ufPy8D6&eventStartDate=2022-07-16&eventEndDate=2022-07-30&fields=*&pageSize=2`, {
        axios.get(`${serveur}api/trackedEntityInstances/${ligne.tei}.json?program=${program_tracker}&fields=*`, {
            headers: {
            'Authorization': Authorization,
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            result = response.data;
  
            for (let j = 0; j < result.enrollments[0].events.length; j++) {
              if (result.enrollments[0].events[j].dataValues.filter(dataElements => dataElements.dataElement===dataElement_maj).length=1) {
                //modification de l'élement de données par la nouvelle valeur
                result.enrollments[0].events[j].dataValues.filter(dataElements => dataElements.dataElement===dataElement_maj)[0].value=newValue;
                console.log(result.enrollments[0].events[j].dataValues.filter(dataElements => dataElements.dataElement===dataElement_maj)[0]);
              }              
            }
            
            //console.log(result);
            //envoi de la modification
            axios.post(`${serveur}api/trackedEntityInstances`, JSON.stringify(result),
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

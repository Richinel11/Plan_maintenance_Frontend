import * as XLSX from 'xlsx';


const readExcel = (file) => {

  return new Promise((resolve, reject) => { //  une promise pour des valeurs asynchroniser et retourne soit une reponse ou une erreur


    const reader =  new FileReader();  // lire les fichiers 

    reader.readAsArrayBuffer(file);
    
    reader.onload = (e) =>  {
      const data = e.target.result;
      //const data = new Uint8Array(e.target.result);  //les informations sont convertir en Array data
      const workbook = XLSX.read(data, {type: "array"});  // use to pass the excel data into array 
      const sheetName = workbook.SheetNames[0];  // fetching  the sheetdata in the excel file
      const sheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); //chamge the data into json before saving
      resolve(excelData);
    };

    reader.onerror = (error) => { // use to display the reader error 
      reject(error);
    };

   
  });
}

export default readExcel;
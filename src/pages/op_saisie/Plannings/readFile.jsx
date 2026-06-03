import * as XLSX from 'xlsx';


// Convertit un objet Date JS en chaîne lisible par React ET exploitable par planningMapper.
// Règle : si l'heure est 00:00 → format date seule YYYY-MM-DD,
//         sinon → format datetime YYYY-MM-DDTHH:mm.
const dateToString = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  const y   = d.getFullYear();
  const m   = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h   = pad(d.getHours());
  const min = pad(d.getMinutes());
  return (h === "00" && min === "00")
    ? `${y}-${m}-${day}`
    : `${y}-${m}-${day}T${h}:${min}`;
};

const readExcel = (file) => {

  return new Promise((resolve, reject) => { //  une promise pour des valeurs asynchroniser et retourne soit une reponse ou une erreur


    const reader =  new FileReader();  // lire les fichiers

    reader.readAsArrayBuffer(file);

    reader.onload = (e) =>  {
      const data = e.target.result;
      // cellDates: true → les cellules date Excel sont converties en objets Date JS
      // au lieu de nombres série (ex: 46200). Cela facilite la conversion ISO en aval.
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const sheetName = workbook.SheetNames[0];  // fetching  the sheetdata in the excel file
      const sheet = workbook.Sheets[sheetName];
      const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Convertir tous les objets Date en chaînes pour éviter l'erreur React
      // "Objects are not valid as a React child (found: [object Date])".
      const excelData = raw.map((row) =>
        Array.isArray(row)
          ? row.map((cell) => (cell instanceof Date ? dateToString(cell) : cell))
          : row
      );

      resolve(excelData);
    };

    reader.onerror = (error) => { // use to display the reader error 
      reject(error);
    };

   
  });
}

export default readExcel;
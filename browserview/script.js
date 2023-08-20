const chart = bb.generate({
  data: {
  	x: 'x',
    columns: [
    	["x"]
    ],
    type: "line", // for ESM specify as: line()
  },
  bindto: ".chart"
});

// Function to download a CSV from a remote server into a string
// Based on: https://stackoverflow.com/questions/30192153/getting-a-remote-csv-file-and-putting-it-into-a-variable
function getCSV(file) {
	var rawFile = new XMLHttpRequest();
	var allText;

	rawFile.open("GET", file, false);
	rawFile.onreadystatechange = function () {
		if(rawFile.readyState === 4)
			if(rawFile.status === 200 || rawFile.status == 0)
				allText = rawFile.responseText;
	};

	rawFile.send();
	return allText;
}

data_csv = getCSV(file = "https://storage.googleapis.com/waterloo-region-data-visualization-tools/reported_crime_data.csv")

var response = Papa.parse(data_csv, {
	header: true
});

// Group data by violation type and statistic
let data = {};
response.data.forEach(function(row) {
	var data_title = `${row.Violations} — ${row.Statistics}`;
	if (typeof(data[data_title]) === 'undefined') {
		data[data_title] = {};
	}
	data[data_title][row.REF_DATE] = row.VALUE;
});

// Populate checkbox list
const fieldset = document.querySelector('fieldset');
Object.entries(data).forEach(function(entry) {
	const [key, value] = entry;
	fieldset.insertAdjacentHTML('beforeend', `<label><input type="checkbox" value="${key}" /> ${key}</label>`);
});

// Populate the chart
fieldset.addEventListener('change', function(event) {
	console.log(event.target.checked);
	if (event.target.checked) {
		let labels = ['x'];
		let series = [event.target.value];
		Object.entries(data[event.target.value]).forEach(function(entry) {
			const [key, value] = entry;
			labels.push(key);
			series.push(value);
		});

		chart.load({
			columns: [
				labels,
				series
			]
		})
	} else {
		chart.unload({ids: event.target.value});
	}
});
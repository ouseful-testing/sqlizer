var execBtn = document.getElementById("execute");
var outputElm = document.getElementById('output');
var errorElm = document.getElementById('error');
var commandsElm = document.getElementById('commands');
var dbFileElm = document.getElementById('dbfile');
var savedbElm = document.getElementById('savedb');

// Start the worker in which sql.js will run
var worker = new Worker("./worker.sql-wasm.js");
worker.onerror = error;

// Open a database
worker.postMessage({ action: 'open' });

// Connect to the HTML element we 'print' to
function print(text) {
	outputElm.innerHTML = text.replace(/\n/g, '<br>');
}
function error(e) {
	console.log(e);
	errorElm.style.height = '2em';
	errorElm.textContent = e.message;
}

function noerror() {
	errorElm.style.height = '0';
}

// Run a command in the database
function execute(commands) {
	tic();
	worker.onmessage = function (event) {
		var results = event.data.results;
		toc("Executing SQL");

		tic();
		outputElm.innerHTML = "";
		for (var i = 0; i < results.length; i++) {
			outputElm.appendChild(tableCreate(results[i].columns, results[i].values));
		}
		toc("Displaying results");
	}
	worker.postMessage({ action: 'exec', sql: commands });
	outputElm.textContent = "Fetching results...";
}

// Create an HTML table
var tableCreate = function () {
	function valconcat(vals, tagName) {
		if (vals.length === 0) return '';
		var open = '<' + tagName + '>', close = '</' + tagName + '>';
		return open + vals.join(close + open) + close;
	}
	return function (columns, values) {
		var tbl = document.createElement('table');
		var html = '<thead>' + valconcat(columns, 'th') + '</thead>';
		var rows = values.map(function (v) { return valconcat(v, 'td'); });
		html += '<tbody>' + valconcat(rows, 'tr') + '</tbody>';
		tbl.innerHTML = html;
		return tbl;
	}
}();

// Execute the commands when the button is clicked
function execEditorContents() {
	noerror()
	execute(editor.getValue() + ';');
}
execBtn.addEventListener("click", execEditorContents, true);

// Performance measurement functions
var tictime;
if (!window.performance || !performance.now) { window.performance = { now: Date.now } }
function tic() { tictime = performance.now() }
function toc(msg) {
	var dt = performance.now() - tictime;
	console.log((msg || 'toc') + ": " + dt + "ms");
}

// Add syntax highlihjting to the textarea
var editor = CodeMirror.fromTextArea(commandsElm, {
	mode: 'text/x-mysql',
	viewportMargin: Infinity,
	indentWithTabs: true,
	smartIndent: true,
	lineNumbers: true,
	matchBrackets: true,
	autofocus: true,
	extraKeys: {
		"Ctrl-Enter": execEditorContents,
		"Ctrl-S": savedb,
	}
});

var xhr = new XMLHttpRequest();
			// For example: https://github.com/lerocha/chinook-database/raw/master/ChinookDatabase/DataSources/Chinook_Sqlite.sqlite
xhr.open('GET', '../data.db', true);
xhr.responseType = 'arraybuffer';

xhr.onload = e => {
    //var uInt8Array = new Uint8Array(xhr.response);
    //var db = new SQL.Database(uInt8Array);
    try {
        worker.postMessage({ action: 'open', buffer: xhr.response }, [xhr.response]);
    }
    catch (exception) {
        worker.postMessage({ action: 'open', buffer: xhr.response });
    }
};
xhr.send();
            


worker.onmessage = function () {
    toc("Loading database from file");
    // Show the schema of the loaded database
    editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
    execEditorContents();
};



// Save the db to a file
function savedb() {
	worker.onmessage = function (event) {
		toc("Exporting the database");
		var arraybuff = event.data.buffer;
		var blob = new Blob([arraybuff]);
		var a = document.createElement("a");
		document.body.appendChild(a);
		a.href = window.URL.createObjectURL(blob);
		a.download = "sql.db";
		a.onclick = function () {
			setTimeout(function () {
				window.URL.revokeObjectURL(a.href);
			}, 1500);
		};
		a.click();
	};
	tic();
	worker.postMessage({ action: 'export' });
}
savedbElm.addEventListener("click", savedb, true);
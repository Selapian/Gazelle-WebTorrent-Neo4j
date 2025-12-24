var tableData;
var records = []; //for DataTable records[]

function setRecords(){
	records = [];
}

function insertTableData(data){
	tableData = data;
}

var types = ["Nonfiction", "Fiction", "Holy Book", "Tome", "Encyclopedia", "Textbook", "Short Story", "Poetry", "Children Book", "Essay", "Journal Article" ]
var media = ["Ebook", "Audiobook"]
var formats = ["PDF", "mp3"]


function getColumns() {
    return [
        {type:'text', required:true, editable:true, name:'name', cssClass:'important', placeholder:'Item Name Here'},
        {type:'money', required:true, name:'price', cssClass:'required', placeholder:'Item Price'},
        {type:'integer', name:'qty', cssClass:'quantity', placeholder:'Qty'},
        {editable:false, name:'total'}
    ];
}

function verifyNumberOfEditableRows(expectedNumber) {
    var $fixture = $( "#qunit-fixture" );
    equal( $("tr.cs-writeable-editmode", $fixture).size(), expectedNumber, "Expect " + expectedNumber + " row(s) to have the cs-writeable-editmode class" );
}

/**
 * Make sure the row is setup properly, including the cells and the content of the cells
 * @param row
 * @param isEditable
 * @param classes - list of css class names that cell inputs should have, in order of the columns.
 *                  Defaults to whatever is defined in the fixture table
 * @param placeholders - list of placeholder values that cell inputs should have, in order of the columns.
 *                  Defaults to whatever is defined in the fixture table
 */
function verifyRow(row, isEditable, classes, placeholders) {
    ok( row.attr("rowId").trim().length > 0, "row should have a 'rowId' attribute" );

    equal( row.children("td").size(), 4, "Row should have 4 cells" );

    if(isEditable == true) {
        ok(row.hasClass("cs-writeable-editmode"), "row should have the cs-writeable-editmode class");

        if(!classes) {
            classes = ["important", 'required', 'quantity', undefined]
        }
        if(!placeholders) {
            placeholders = ['Item Name Here', 'Item Price', 'Qty', undefined]
        }
        verifyCells(row, true, classes, placeholders);
    }
    else {
        ok(!row.hasClass("cs-writeable-editmode"), "row should NOT have the cs-writeable-editmode class");
    }
}

/**
 * Make sure the cells in the given row are setup properly
 * @param row
 * @param isEditable
 * @param classes -list of css class names that cell inputs should have, in order of the columns
 * @param placeholders - list of placeholder values that cell inputs should have, in order of the columns.
 */
function verifyCells(row, isEditable, classes, placeholders) {
    var cells = row.children("td");
    var rowId = row.attr('rowId');

    var rowName = "players["+rowId+"]"

    if(isEditable == true) {
        verifyCellContents($(cells[0]), true, rowName + ".name", classes[0], placeholders[0]);
        verifyCellContents($(cells[1]), true, rowName + ".price", classes[1], placeholders[1]);
        verifyCellContents($(cells[2]), true, rowName + ".qty", classes[2], placeholders[2]);
        verifyCellContents($(cells[3]), false, rowName + ".total", classes[3], placeholders[3]);
    }
}

function verifyCellContents(cell, isEditable, rowId, cssClass, placeholder) {
    if(isEditable == true) {
        equal( cell.has('input[type=text]').size(), 1, "Cell should have a text input" );
        equal( cell.has('span:hidden').size(), 1, "Cell should have a hidden span element (for holding static value)" );

        var input = cell.find("input");
        var spanContent = $("span", cell).text();
        equal( spanContent, input.val(), "< span > content must equal input's value" );
        validateCellInput(cell.find("input"), rowId, spanContent, cssClass, placeholder);
    }
    else {
        equal( cell.has('input[type=text]').size(), 0, "Cell should NOT have a text input - it is not editable" );
    }
}

function validateCellInput(input, id, value, cssClass, placeholder) {
    equal(input.attr("name"), id, "input should have name="+id);
    equal(input.attr("id"), id, "input should have id="+id);
    equal(input.attr("value"), value, "input should have value="+value);
    equal(input.attr("class"), cssClass, "input should have class="+cssClass);
    equal(input.attr("placeholder"), placeholder, "input should have placeholder="+placeholder);
}

///////////////////////////////////////////// TESTS ///////////////////////////////////////////////////

function testCreate(useMetadata) {
    var $fixture = $( "#qunit-fixture" );

    if(useMetadata) {
        $("table", $fixture).writetable();  // column properties are set in the fixture; relying on autoAddRow=true
    }
    else {
        $("table", $fixture).writetable({
            tableName: 'players',
            columns:getColumns()
        });
    }

    var $body = $("#qunit-fixture table tbody");
    equal( $body.find("tr").size(), 3, "Table should have 3 rows after initializing with default autoAddRow=true" );

    verifyNumberOfEditableRows(1);
    var editableRow = $("tr.cs-writeable-editmode");
    verifyRow(editableRow, true);
}

function testCreate_autoAddRow_turned_off(useMetadata) {
    var $fixture = $( "#qunit-fixture" );

    var $body = $("tbody", $fixture);
    equal( $("tr", $body).size(), 2, "Table should have 2 rows to start with" );

    if(useMetadata) {
        $("table", $fixture).attr('data', "{tableName:'players', autoAddRow:false}");
    }
    else {
        $("table", $fixture).writetable({
            tableName: 'players',
            autoAddRow:false,
            columns:getColumns()
        });
    }

    equal( $("tr", $body).size(), 2, "Table should still have 2 rows to after applying csWritableTable with autoAddRow turned off" );
    verifyNumberOfEditableRows(0);
}

function testCreate_addRow_on_autoAddRow_off(useMetadata) {
    var $fixture = $("#qunit-fixture");
    var $body = $("tbody", $fixture);
    equal($("tr", $body).size(), 2, "Table should have 2 rows to start with");

    if(useMetadata) {
        $("table", $fixture).attr('data', "{tableName:'players', enableAddRow:true, autoAddRow:false}");
        $("table", $fixture).writetable();
    }
    else {
        $("table", $fixture).writetable({
            tableName: 'players',
            enableAddRow:true,
            autoAddRow:false,
            columns:getColumns()
        });
    }

    equal( $body.find("tr").size(), 2, "Table should have 2 rows after initializing with autoAddRow off" );
    verifyNumberOfEditableRows(0);

    $("table", $fixture).writetable('addRow');  //call the addRow method
    equal( $("tr", $body).size(), 3, "Table should have 3 rows to after calling addRow()" );
    verifyNumberOfEditableRows(1);

    $("table", $fixture).writetable('addRow');  //try to add another row; since nothing was added in the current new row, no new row should appear
    equal( $("tr", $body).size(), 3, "Table should still have 3 rows to after calling addRow() a second time, without adding any values" );
    verifyNumberOfEditableRows(1);
}

/**
 * Verify behavior with addRow:false and autoAddRow:false options
 * @param useMetadata - flag to indicate whether the test assumes use of metadata plugin or not
 */
function testAddRow_with_addRow_off_autoAddRow_off(useMetadata) {
    var $fixture = $( "#qunit-fixture" );

    if(useMetadata) {
        //initialize the plugin with metadata attributes
        $("table", $fixture).attr('data', "{tableName:'players', enableAddRow:false, autoAddRow:false}");

        $("table", $fixture).writetable();
    }
    else {
        //initialize the plugin by passing in options explicitly
        $("table", $fixture).writetable({
            tableName: 'players',
            enableAddRow:false,
            autoAddRow:false,
            columns:getColumns()
        });
    }

    var $body = $("tbody", $fixture);
    equal( $("tr", $body).size(), 2, "Table should have 2 rows to start with" );

    verifyNumberOfEditableRows(0);   //none of the rows should be editable to start

    var row1 = $("tr", $body).first();
    var row2 =  $("tr", $body).last();
    verifyRow(row1, false);
    verifyRow(row2, false);

    equal( $("tr", $body).size(), 2, "Table should have 2 rows after initializing with autoAddRow off" );
    equal( $("tr.cs-writeable-editmode", $body).size(), 0, "None of the rows should start out in edit mode" );

    $("table", $fixture).writetable('addRow');

    equal( $("tr", $body).size(), 2, "Table should still have 2 rows to after calling addRow() when addRow is disabled" );
    verifyNumberOfEditableRows(1);

    //TODO: if a row cannot be added, provide a means (via a callback mechanism) to notify the user, and test for it here.
}

function testRowSelected(useMetadata) {
    var $fixture = $( "#qunit-fixture" );

    if(useMetadata) {
        $("table", $fixture).attr('data', "{tableName:'players', enableAddRow:true, autoAddRow:false}");
        $("table", $fixture).writetable();
    }
    else {
        $("table", $fixture).writetable({
            tableName: 'players',
            enableAddRow:true,
            autoAddRow:false,
            columns:getColumns()
        });
    }

    var $body = $("#qunit-fixture table tbody");

    equal( $("tr", $body).size(), 2, "Table should have 2 rows to start with" );
    verifyNumberOfEditableRows(0);

    var row1 = $("tr", $body).first();
    var row2 =  $("tr", $body).last();

    row1.click();     //simulate a click on row 1
    verifyRow(row1, true);
    verifyRow(row2, false);
    equal( $(row1.children("td").last()).html(), "$8429.90", "Non-editable cell 'Total' in row1 should have a static value of $8429.90");
    verifyNumberOfEditableRows(1);

    row2.click();     //simulate a row click on row 2
    verifyRow(row1, false);
    verifyRow(row2, true);
    equal( $(row2.children("td").last()).html(), "$2598.00", "Non-editable cell 'Total' in row2 should have a static value of $2598.00");
    verifyNumberOfEditableRows(1);

    row1.click();     //simulate another click on row 1
    verifyRow(row1, true);
    verifyRow(row2, false);
    equal( $(row1.children("td").last()).html(), "$8429.90", "Non-editable cell 'Total' in row1 should have a static value of $8429.90");
    verifyNumberOfEditableRows(1);

    //add a row, but don't enter any values, then click away from it. The blank row should be removed
    $("table", $fixture).writetable("addRow");
    equal( $("tr", $body).size(), 3, "Table should have 3 rows after call to addRow" );
    var row3 = $("tr", $body).last();
    verifyRow(row3, true);
    verifyNumberOfEditableRows(1);
    row1.click();
    equal( $("tr", $body).size(), 2, "Table should have 2 rows after clicking first row when nothing entered in the new row" );
    verifyNumberOfEditableRows(1);

    //add a row, then immediately click on it. Make sure the new row is not removed right from under you.
    $("table", $fixture).writetable("addRow");
    equal( $("tr", $body).size(), 3, "Table should have 3 rows after call to addRow" );
    var row3 = $("tr", $body).last();
    verifyRow(row3, true);
    verifyNumberOfEditableRows(1);
    row3.click();
    equal( $("tr", $body).size(), 3, "Table should still have 3 rows after clicking the new blank row" );
    verifyNumberOfEditableRows(1);
}
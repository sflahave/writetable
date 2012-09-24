This is a simple jQuery UI plugin to make HTML tables editable.
The plugin plays nicely with the jquery metadata plugin. 
It is intended to be used to make tabular data editable, one row at a time. That is - it expects to be given
an HTML table element containing tabular data (not for a table used for layout purposes). The table should include the 
<thead> and <tbody> elements. The plugin will simply add form inputs to each cell, using the following naming convention:
collectionName[index].propertyName 

Look at the examples to see how to use it.  

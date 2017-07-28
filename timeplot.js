/* script used by the report page of thalemine (report.jsp), if protein
//
// INPUT:   - the protein id (primaryIdentifier)
//          - the mine url (if not present, defaults to araport)
// OUTPUT:  bar chart displaying the various domains associated with the protein
//
*/

// to set the mine: could be done inside js with injection
// here using a parameter from jsp

/*
var BASEURL = mineUrl + "/service/query/results?query=";
var QUERYSTART = "%3Cquery%20model=%22genomic%22%20view=%22" +
"Protein.proteinDomainRegions.start%20Protein.proteinDomainRegions.end%20" +
"Protein.proteinDomainRegions.database%20Protein.proteinDomainRegions.identifier%20" +
"Protein.proteinDomainRegions.proteinDomain.shortName%20" +
"Protein.proteinDomainRegions.proteinDomain.primaryIdentifier%22%20%3E%20%3C" +
// "Protein.proteinDomainRegions.proteinDomain.primaryIdentifier%20" +
// "Protein.proteinDomainRegions.id%22%20%3E%20%3C" +
"constraint%20path=%22Protein.primaryIdentifier%22%20op=%22=%22%20value=%22";
var QUERYEND="%22/%3E%20%3C/query%3E";
var QUERY= BASEURL + QUERYSTART + queryId + QUERYEND;
var PORTAL = "portal.do?class=ProteinDomain&externalids=";
*/


// DEFAULTS
var DEFAULT_MINEURL = "http://rumenmine-dev.ibers.aber.ac.uk/rumenmine-dev";
var DEFAULT_ID = "p15539";
var DEFAULT_SVG = "tchart";
var DEFAULT_TYPE = "Gene";

if(typeof mineUrl === 'undefined'){
   mineUrl = DEFAULT_MINEURL;
 };

if(typeof queryId === 'undefined'){
   queryId = DEFAULT_ID;
 };

//if(typeof svgId === 'undefined'){
   svgId = DEFAULT_SVG;
// };

if(typeof type === 'undefined'){
   type  = DEFAULT_TYPE;
 };

var constraintOp = '=';
var constraintPath = 'primaryIdentifier';

if(typeof listName != 'undefined'){ // set only on a bagDetails page
    queryId = listName;
    constraintOp = 'IN';
    constraintPath = type;
 };

console.log(type + ": " + svgId + " " + mineUrl + " " + queryId + " (" + constraintOp + " " + constraintPath + ")");

// QUERY (valid both for list and id)
var query    = {
  "from": type,
  "select": [
    "primaryIdentifier",
    "symbol",
    "RNASeqExpressions.expressionLevel",
    "RNASeqExpressions.unit",
    "RNASeqExpressions.experiment.SRAaccession",
    "RNASeqExpressions.experiment.timePoint",
    "RNASeqExpressions.experiment.tissue"
  ],
  "orderBy": [
    {
      "path": "primaryIdentifier",
      "direction": "ASC"
    },
    {
      "path": type + ".RNASeqExpressions.experiment.timePoint",
      "direction": "ASC"
    },
    {
      "path": type + ".RNASeqExpressions.experiment.tissue",
      "direction": "ASC"
    }
  ],
  "where": [
    {
     "path": constraintPath,
      "op": constraintOp,
      "value": queryId,
      "code": "A"
    }
  ]
};


// Displayer defaults and constants
var GPORTAL = "portal.do?class=" + type + "&externalids=";
var EPORTAL = "portal.do?class=RnaseqExperiment&externalids=";

//================



var svg = d3.select("#" + svgId);

var colors = d3.scale.category20();
//var colors = d3.scale.category10();

// Will hold our data
//var alldata = null

// margins
var margin = {top: 40, right: 20, bottom: 30, left: 60}

// Original Width
var width = parseInt(svg.style("width"));

// Store our scale so that it's accessible by all:
var x= null;
var xAxis = null;

// Static bar type:
var barHeight = 20;

var render = function() {

var graphW = width - margin.left;
  var max = d3.max(data, function(d) { return +d[2];} );
  var sf = graphW/max;  //scale factor

console.log("WWW " + width + " MAX: " + max + " SF " + sf);


  x = d3.scale.linear()
  .domain([0, d3.max(data, function(d) {return d[2]})])
  .range([0, graphW]);
  //.range([0, width]);

  xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  // when no results don't display anything
  svg.attr("height", 0);

  if (data.length > 0) {

  // Build the report header
    head = svg.append('foreignObject')
      .attr("class", "myheader")
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', 20)
      //.attr('fill', )
      .append("xhtml:body")
      .html('<h3 class="goog"> ' + data.length + ' Protein Domain Regions - source: InterPro</h3>\
             <p> <p>');

  // Size our SVG tall enough so that it fits each bar.
  // Width was already defined when we loaded.
  svg.attr("height", margin.top + (barHeight * data.length) + margin.bottom);

  }

  // Draw our elements!!
  var bar = svg.selectAll("g")
      .data(data)

  // New bars:
  bar.enter().append("g")
      .attr("class", "proteinbar")
      .attr("transform", function(d, i) {
        //return "translate(" + 0 + "," + (margin.top + (i * barHeight)) + ")";
        return "translate(" + margin.left + "," + (margin.top + (i * barHeight)) + ")";
      });

  bar.append("a")
    .on("mouseover", function(d, i){
      d3.select(this)
          .attr({"xlink:href": mineUrl + GPORTAL + d[5]});
    })
    .append("rect")
    .attr("width", function(d) { return d[2]*sf})
    .attr("height", barHeight - 1)
    .style("fill", function(d, i) { return colors(d[6])});

  bar.append("a")
    .on("mouseover", function(d){
      d3.select(this)
          .attr({"xlink:href": mineUrl + GPORTAL + d[5]});
      })
    .append("text")
    .attr("x", function(d) { return d[2]*sf - 3; })
    .attr("y", barHeight / 2)
    .attr("dy", ".35em")
    // .text(function(d) { return (d[5] + "-" + d[6] + ": " + d[2] )});
    .text(function(d) { return (d[6] + ": " + d[2] )});

bar.append("a")
  .on("mouseover", function(d){
    d3.select(this)
        .attr({"xlink:href": mineUrl + GPORTAL + d[5]});
    })
  .append("text")
  .attr("x", -50)
  .attr("y", barHeight / 2)
  .attr("dy", ".35em")
//      .text(function(d) { return (d[0] + "..." + d[1] + " " + d[2]+": "+ d[3] + " " + d[4])});
  .text(function(d) { return (d[5])});



  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) {
        //return "translate( 0 " + "," + (margin.top + (barHeight * data.length) +5 ) + ")"})
        return "translate(" + margin.left  + "," + (margin.top + (barHeight * data.length) +5 ) + ")"})
      .call(xAxis);

    svg.append("rect")
      .attr("class", "boundingbox")
      .attr("x", 0)
      .attr("y", (margin.top - 5))
      .attr("height", (10 + barHeight * data.length))
      .attr("width", width -15)
      .style("stroke", "grey")
      .style("fill", "none")
      .style("stroke-width", 1);
}

var range = function(d) {
  //var beginning = x(d[0]);
  var beginning = 0;
  var end = x(d[2]);
  var range = end - beginning;
  //console.log("range", end - beginning);
  return range;
}

var rescale = function() {

  // The new width of the SVG element
  var newwidth = parseInt(svg.style("width"));
  var max = d3.max(data, function(d) { return +d[2];} );
  var sf= (newwidth - margin.left)/max;

  // Our input hasn't changed (domain) but our range has. Rescale it!
  x.range([0, newwidth]);

  // Use our existing data:
  var bar = svg.selectAll(".proteinbar").data(data)

  bar.attr("transform", function(d, i) {
        //return "translate(" + x(d[2]) + "," + (margin.top + (i * barHeight)) + ")";
        //return "translate(" + 0 + "," + (margin.top + (i * barHeight)) + ")";
        return "translate(" + margin.left + "," + (margin.top + (i * barHeight)) + ")";
      });

  // For each bar group, select the rect and reposition it using the new scale.
  bar.select("rect")
      .attr("width", function(d) { return range(d); })
      .attr("height", barHeight - 1)
      .style("fill", function(d, i) { return colors(d[6])});

  // Also reposition the bars using the new scales.
  bar.select("text")
      //.attr("x", function(d) { return range(d) - 3; })
      .attr("x", function(d) { return d[2]*sf - 3; })
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      // .text(function(d) { return (d[0] + "..." + d[1] + " " + d[2]+": " + d[3] + " " + d[4])});
      .text(function(d) { return (d[6] + ": " + d[2] )});

  // resize the bounding box
  var bb = svg.select(".boundingbox").attr("width", newwidth);

  // resize the x axis
  xAxis.scale(x);
  svg.select(".x.axis").call(xAxis);

  // resize the header
  head = svg.select(".myheader").attr("width", newwidth);

}

// Fetch our JSON and feed it to the draw function

var myService = null;
if(typeof token === 'undefined' || token === null){
  // never happens from the webapp, just for local test
   myService = new imjs.Service({root: mineUrl + 'service/'});
 } else { // normal workings
   myService = new imjs.Service({root: mineUrl, token: token});
};

//var myService = new imjs.Service({root: mineUrl, token: token});


myService.rows(query).then(function(rows) {
  data = rows;
  render();
});

// was:
//d3.json(query, function(returned) {
//  data = returned.results;
//  render();
//});

// Rescale it when the window resizes:
d3.select(window).on("resize", rescale);

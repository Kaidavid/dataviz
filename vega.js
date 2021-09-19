$( document ).ready(function() {
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl)
    })
    
    
    function csvJSON(csv) {
        var lines=csv.split("\r\n");
        var result = [];
        var headers=lines[0].split(",");
        
        for(var i=1;i<lines.length;i++){
      
            var obj = {};
            if(lines[i] == undefined || lines[i].trim() == "") {
                continue;
            }
            var currentline=lines[i].split(",");
      
            for(var j=0; j<headers.length;j++){
                obj[headers[j]] = currentline[j];
            }
            result.push(obj);
        }
      
        return JSON.stringify(result); //JSON
    }
    
    var attendedYearList = [], attendedTermList = [], entire_obj = [];
    function graphOnPageLoad(v) {
        var attendedYearSet = new Set();
        var attendedTermSet = new Set();
        entire_obj = JSON.parse(v);
        entire_obj.filter((element) => attendedYearSet.add(element.Year));
        entire_obj.filter((element) => attendedTermSet.add(element.Term));
        attendedYearList = Array.from(attendedYearSet).sort();
        attendedTermList = Array.from(attendedTermSet);
        //inject attended years tab into html
        for(let i=0; i<attendedYearList.length; i++){
            document.getElementById('years').innerHTML += '<button class="dropdown-item" id="year_' + i + '">' + attendedYearList[i] + '</button>';
        }
        for(let i=0; i<attendedTermList.length; i++){
            document.getElementById('terms').innerHTML += '<button class="dropdown-item" id="term_' + i + '">' + attendedTermList[i] + '</button>';
        }
    }
    
        
    var vega_initial = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: {"url": "data/courses.csv"},
        mark: 'bar',
        width: 'container',
        height: 275,
        encoding: {
            y: {
                field: 'Department',
                title: "Department",
                type: 'nominal',
                sort: '-x',
            },
            x: {
                aggregate: "count",
                title: 'Number of courses from the Dept.',
                type: 'quantitative',
            },
            opacity: {
                'value': 0.8
            },
            color: {
                'value': '#003f5c'
            }
        },
    };
    
    
    var vega_fixed = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: {"url": "data/courses.csv"},
        mark: "bar",
        width: "container",
        height: 250,
        encoding: {
          x: {
            field: "Year",
            type: "ordinal",
            title: "Year"
          },
          y: {
            aggregate: "sum",
            field: "Credit",
            type: "quantitative",
            title: "Credits"
          },
          color: {
            field: "Department",
            type: "nominal",
            scale: {
              domain: ["Materials Science and Engineering", "School of Humanities & Social Sciences", "School of Computing", "Department of Mathematical Sciences", "Physics", "Chemistry", "Chemical and Biomolecular Engineering", "Biological Sciences"],
              range: ["#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600"]
            },
            title: "Departments"
          }
        },
    }
    
    
    var vega_changing = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: {
            name: 'myData'
        },
        mark: 'bar',
        width: 'container',
        height: 275,
        encoding: {
            y: {
                field: 'Department',
                title: 'Department',
                type: 'nominal',
                sort: '-x',
            },
            x: {
                aggregate: "count",
                title: 'Number of Courses',
                type: 'quantitative',  
            },
            color: {
                field: "Department",
                type: "nominal",
                scale: {
                    domain: ["Materials Science and Engineering", "School of Humanities & Social Sciences", "School of Computing", "Department of Mathematical Sciences", "Physics", "Chemistry", "Chemical and Biomolecular Engineering", "Biological Sciences"],
                    range: ["#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600"]
                },
                title: "Departments List",
            },
            opacity: {
                'value': 0.9
            },
        },
        autosize: { 
            type: 'fit',
            resize: 'true'
        },
    };
    
    
    vegaEmbed('#fixed', vega_fixed)
    vegaEmbed('#initial', vega_initial)
    
    const response = fetch('data/courses.csv')
        .then(response => response.text()) 
        .then(function(v) { 
            return csvJSON(v);
        })    
        .then(function(v) {
            return graphOnPageLoad(v);
        })
        .catch(err => console.log(err))
     
    
    var selectedYear = 0;
    vegaEmbed('#changing', vega_changing)
        .then(function(res) {
            function injectData(index) {     
                myArray = index.split("_");
                if(myArray[0] == "year") {
                   selectedYear = attendedYearList[myArray[1]];
                   var dataVal = entire_obj.filter((element) => element.Year === selectedYear);
                   var changeSet = vega.changeset()
                        .remove(() => true)
                        .insert(dataVal);
                    res.view.change('myData', changeSet).run();
                }
                if(myArray[0] == "term" && selectedYear != 0) {
                    var dataVal = entire_obj.filter((element) => (element.Year === selectedYear) && (element.Term === attendedTermList[myArray[1]]));
                    console.log(dataVal);
                    var changeSet = vega.changeset()
                        .remove(() => true)
                        .insert(dataVal);
                    res.view.change('myData', changeSet).run();
                }
                
            }
           
            response.then(function(v) {
                injectData("year_0");
    
                document.getElementById("year_0").addEventListener("click", function() {
                    injectData("year_0");
                })
                document.getElementById("year_1").addEventListener("click", function() {
                    injectData("year_1");
                })
                document.getElementById("year_2").addEventListener("click", function() {
                    injectData("year_2");
                })
                document.getElementById("year_3").addEventListener("click", function() {
                    injectData("year_3");
                })
                document.getElementById("term_0").addEventListener("click", function() {
                    injectData("term_0");
                })
                document.getElementById("term_1").addEventListener("click", function() {
                    injectData("term_1");
                })
            })    
    });
    
});
import { Component, OnInit, ElementRef} from '@angular/core';
import { NONE_TYPE } from '@angular/compiler/src/output/output_ast';
import { saveAs } from 'file-saver';

declare var $;
declare var d3;
declare var d3sparql;
declare var require; 
const endpoint = 'https://dbpedia.org/sparql';
const dbr = 'PREFIX dbr:<http://dbpedia.org/resource/>';
const dbo = 'PREFIX dbo:<http://dbpedia.org/ontology/>';
const dbp = 'PREFIX dbp:<http://dbpedia.org/property/>';
const rdf = 'PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>';
const rdfs = 'PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>';
const xsd = 'PREFIX xsd:<http://www.w3.org/2001/XMLSchema#>';
//let sparql = dbr + dbo + dbp + 'SELECT ?path WHERE {dbr:Karl_Marx dbo:thumbnail ?path.}';
let sparql = dbr + dbo + dbp + 'SELECT ?peoples WHERE {dbr:Bob_Black dbo:influencedBy ?x.\ndbr:Bob_Black dbo:influenced ?y.\n?y dbo:influencedBy ?s.\nOPTIONAL {?people dbo:thumbnail ?path.}}';

const dataset = {
  nodes: [],
  relationships: [],
  highestId: 0,
  internalScale: 1
};
const parameters = {
  radius: 50,
  nodeStrokeWidth: 8,
  nodeStartMargin: 11,
  nodeEndMargin: 11,
  speechBubbleMargin: 20,
  speechBubblePadding: 10,
  speechBubbleStrokeWidth: 3,
  snapTolerance: 20,
  insideRadius: 46
};
@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {
  
  dynamicContent = '';

  constructor(
    private el: ElementRef
  ) { }

  labelChanged(e) {
    const keycode = window.event ? e.keyCode : e.which;
    if (keycode === 13) {// 回车键
      console.log('回车');

    }
  }

  typeChanged(e) {
    const keycode = window.event ? e.keyCode : e.which;
    if (keycode === 13) {// 回车键
      console.log('回车');

    }
  }

  predicateChanged(e) {
    const keycode = window.event ? e.keyCode : e.which;
    if (keycode === 13) {// 回车键

    }
  }

  ngOnInit() {
    dataset.highestId += 1;
    let s = '';
    s += ' 网页可见区域宽：' + document.body.clientWidth+'\n';
    s += ' 网页可见区域高：' + document.body.clientHeight+'\n';
    s += ' 网页可见区域宽：' + document.body.offsetWidth + ' (包括边线和滚动条的宽)'+'\n';
    s += ' 网页可见区域高：' + document.body.offsetHeight + ' (包括边线的宽)'+'\n';
    s += ' 网页正文全文宽：' + document.body.scrollWidth+'\n';
    s += ' 网页正文全文高：' + document.body.scrollHeight+'\n';
    s += ' 网页被卷去的高(ff)：' +  document.body.scrollTop+'\n';
    s += ' 网页被卷去的高(ie)：' + document.documentElement.scrollTop+'\n';
    s += ' 网页被卷去的左：' + document.body.scrollLeft+'\n';
    s += ' 网页正文部分上：' + window.screenTop+'\n';
    s += ' 网页正文部分左：' + window.screenLeft+'\n';
    s += ' 屏幕分辨率的高：' + window.screen.height+'\n';
    s += ' 屏幕分辨率的宽：' + window.screen.width+'\n';
    s += ' 屏幕可用工作区高度：' + window.screen.availHeight+'\n';
    s += ' 屏幕可用工作区宽度：' + window.screen.availWidth+'\n';
    s += ' 你的屏幕设置是 ' + window.screen.colorDepth +' 位彩色'+'\n';
    console.log(s);
    const node = new Node().x(0).y(0).id(dataset.highestId - 1).caption('Karl_Marx');
    node.imageurl('https://commons.wikimedia.org/wiki/Special:FilePath/Karl_Marx_001.jpg?width=300');
    node.variable = false;
    dataset.nodes.push(node);
    drawNodes([node]);
    // createNode(0, 0).imageurl('http://commons.wikimedia.org/wiki/Special:FilePath/Karl_Marx_001.jpg?width=300').caption('Karl_Marx');
    $(function() {
      $( 'input#node_caption' ).autocomplete({
          minChars: 3,
          source: function( request, response ) {
            if ( request.term.length < 3) {
              const resultss = 'waiting...';
              response( $.map( resultss, function( item ) {
                return {
                  label: item,
                  value: item
                };
              }));
            }
            sparql = dbr + dbo + dbp + rdf + ' SELECT ?person WHERE {?person rdf:type dbo:Person. FILTER( regex ((?person), \'' + request.term.toString() + '\' ))} LIMIT 20';
            d3sparql.query(endpoint, sparql, render);
            function render(json, bug) {
              if ( json != null && json.results.bindings.length !== 0 ) {// 请求成功
                const results = json.results.bindings;
                response( $.map( results, function( item ) {
                  return {
                    label: item.person.value.slice(28),
                    value: item.person.value.slice(28)
                  };
                }));
              } else { // 请求失败

              }
            }
          },
       });
    });

      $(function() {
        const tags = [
          'influencedBy',
          'region',
          'notableIdea',
          'philosophicalSchool',
          'influenced',
          'era',
          'deathYear',
          'birthDate',
          'birthYear'
        ];
        $( 'input#relationship_type' ).autocomplete({
            minChars: 3,
            source: tags
        });
      });

      $(function() {
        const tags = [
          'Athlete',
          'OrganisationMember',
          'Artist',
          'OfficeHolder',
          'Politician',
          'MilitaryPerson',
          'Writer',
          'Monarch',
          'BeautyQueen',
          'Philosopher',
          'Model',
          'Journalist',
          'Economist',
          'Religious',
          'BusinessPerson'
        ];  
        $( 'input#node_type' ).autocomplete({
            minChars: 3,
            source: tags
        });
      });
    }

  onClick() {
    createNode(0, 100, 0);
  }

  d3force() {
    //力学背景
    const editor = d3.select('.pop-up-editor.force');
    if (editor[0][0].classList[3] === 'hide') {
      editor.classed('hide', false);

      var nodeset = [];
      var edgeset = [];

      const nodes = d3.selectAll('.image_test');
      console.log('点');

      for (const node of nodes[0]) {
        const temp_node = node.__data__;
        const temp = nodeset.indexOf(temp_node);
        console.log(temp);
        nodeset.push(temp_node);
      }

      const edges = d3.selectAll('.relationship_view');
      console.log('边');
      for (const edge of edges[0]) {
         edge.source = nodeset.indexOf(edge.__data__.start);
         edge.target = nodeset.indexOf(edge.__data__.end);
         const temp_edge = edge;
         edgeset.push(temp_edge);
       }
      const force = d3.layout.force()
                           .nodes(nodeset)		// 指定节点数组
                           .links(edgeset)		// 指定连线数组
                           .size([800, 800])	// 指定范围
                           .linkDistance(800)	// 指定连线长度
                           .charge(-6000);	// 相互之间的作用力
      force.start();

      // var svg_edges = d3.selectAll('#d3graph_force').selectAll("line")
      //     .data(edgeset)
      //     .enter()
      //     .append("line")
      //     .style("stroke","#ccc")
      //     .style("stroke-width",1);
      //边
      const edge_force = d3.selectAll('#d3graph_force').selectAll('edge.g')
          .data(edgeset)
          .enter()
          .append('g')
          .attr('class', 'edges-force')
          .attr('transform', function(d) {
            const dx = d.__data__.end.ex() - d.__data__.start.ex();
            const dy = d.__data__.end.ey() - d.__data__.start.ey();
            console.log(d);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            return 'translate(' + d.__data__.start.ex() + ',' + d.__data__.start.ey() + ') rotate(' + angle + ')';
          });

      const edge = edge_force.append('path')
        .attr('class', 'edge-force')
        .attr('fill', 'rgb(255, 255, 255)')
        // .attr('id', function(d) {
        //   return 'id' + d.id();
        // })
        .attr('stroke', 'rgb(0, 0, 0)')
        .attr('stroke-dasharray', function(d) {
          console.log('force_data');
          console.log(d.__data__);
          if (d.__data__.variable) {
            return '10';
          } else {
            return 'none';
          }
        })
        .attr('stroke-width', '3px')
        .attr('d', function(d) {
          console.log(d.__data__.arrow.outline);
          return d.__data__.arrow.outline; });
      const edge_text = edge_force.append('text')
        .attr('class', 'type')
        .attr('transform', function(d) {
          return rotateIfRightToLeft_force(d.__data__);
        })
        .attr('text-anchor', 'middle')
        .attr('baseline-shift', '30%')
        .attr('alignment-baseline', 'alphabetic')
        .attr('x', function(d) { return side_force( d.__data__ ) * d.__data__.arrow.apex.x; } )
        .attr('y', 0 )
        .attr( 'font-size', '50px')
        .attr( 'font-family', '"Gill Sans", "Gill Sans MT", Calibri, sans-serif')
        .text( function ( d ) { return  d.__data__.predicate(); } )
        .attr('transform', function(d){
          if(d.__data__.end.ex() > d.__data__.start.ex()){
            return null;
          } else {
            return 'rotate(180)';
          }
        });

      //点
      const node_force = d3.selectAll('#d3graph_force').selectAll('circle.g')
          .data(nodeset)
          .enter()
          .append('g')
          .attr('class', 'nodes-force');

      //图片
      const image = node_force.append('image').attr('class', 'image-force')
        .attr('href', function(d) {
          return d.imageurl();
        })
        .attr('x', function(d) {
          return d.x - 75;
        })
        .attr('y', function(d) {
          return d.y - 60;
        })
        .attr('height', '150')
        .attr('width', '150')
        .attr('clip-path', 'circle(60px at 75px 60px)')
        .attr('display', 'true');

      //圆环
      const circle = node_force.append('circle')
        .attr('class', 'circle-force')
        .attr('stroke-dasharray', function(d) {
          console.log('#########');
          console.log(d.variable);
          if (d.variable === undefined) {
            return 'none';
          } else if (d.variable) {
            return '15';
          } else {
            return 'none';
          }
        })
        .attr('id', function(d) {
          return 'id' + d.id();
        })
        .attr('r', function(d) {
          return 60;
        })
        .attr('stroke', 'rgb(0,0,0)')
        .attr('stroke-width', '8px')
        .attr('fill', 'rgba(255, 255, 255, 0)')
        .attr('cx', function(d) {
          return d.x;
        })
        .attr('cy', function(d) {
          return d.y;
        })
        .call(force.drag);

      //环
      const ring = node_force.append('circle')
        .attr('class', 'ring-force')
        .attr('r', function(d) {
          return 65;
        })
        .attr('stroke', 'rgba(255,255,255,0)')
        .attr('stroke-width', '10px')
        .attr('fill', 'none')
        .attr('cx', function(d) {
          return d.x;
        })
        .attr('cy', function(d) {
          return d.y;
        })
        
      //文字
      const node_text = node_force.append('text')
        .attr('class', 'text-force')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'central')
        .attr('x', function(d) {
          return d.x;
        })
        .attr('y', function(d) {
          return d.y - 95;
        })
        .attr( 'fill', 'rgb(51,51,51)' )
        .attr( 'font-size', '50px')
        .attr( 'font-family', '\'Gill Sans\', \'Gill Sans MT\', Calibri, sans-serif')
        .text(function(d) {
          return d.caption();
        });

      
      //对于每一个时间间隔--------------------刷新
      force.on('tick', function() {	
      //更新节点坐标
      image.attr('x', function(d) { return (parseInt(d.x, 10) - 75).toString(); })
            .attr('y', function(d) { return (parseInt(d.y, 10) - 60).toString(); })
            .attr('clip-path', function(d) {
              const tempx = ((parseInt(d.x, 10)) * 0.001 + 75).toString();
              const tempy = ((parseInt(d.y, 10)) * 0.001 + 60).toString();
              return 'circle(60px at ' + tempx + 'px ' + tempy + 'px)'
            });
      ring.attr('cx', function(d) { return d.x; })
          .attr('cy', function(d) { return d.y; });
      circle.attr('cx', function(d) { return d.x; })
          .attr('cy', function(d) { return d.y; });
      node_text.attr('x', function(d) { return d.x; })
      .attr('y', function(d) { return d.y - 95; });
      

      // svg_edges.attr("x1",function(d){ return d.source.x; })
			//  		.attr("y1",function(d){ return d.source.y; })
			//  		.attr("x2",function(d){ return d.target.x; })
      //  		.attr("y2",function(d){ return d.target.y; });
      
      edge_force.attr('transform', function(d) {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          return 'translate(' + d.source.x + ',' + d.source.y + ') rotate(' + angle + ')';
        });
      edge.attr('d', function(d) {
        console.log(horizontalArrow_force(d.source,d.target, 0).outline);
        return horizontalArrow_force(d.source,d.target, 0).outline; });
      edge_text.attr('transform', function(d){
        if(d.target.x > d.source.x){
          return null;
        } else {
          return 'rotate(180)';
        }
      })
      .attr('x', function(d) { return -1 * side_force( d.__data__ ) * horizontalArrow_force(d.source,d.target, 0).apex.x; } );


      scaleZoom_force();
    });
    } else {
      const temp = d3.selectAll('.graphdiagram_force');
      for (let i = 0; i < temp[0][0].childNodes.length; ) {
        temp[0][0].childNodes[i].parentNode.removeChild(temp[0][0].childNodes[i]);
      }
      editor.classed('hide', true);
    }
  }

  showCode() {
    const editor = d3.select('.pop-up-editor.code');
    const captionField = editor.select('#query_code');

    console.log(sparql);
    //let sparql_temp=sparql;
    let sparql_temp = sparql.replace(/>/g,'>\n');
    sparql_temp = sparql_temp.replace(/{/g,'{\n');


    sparql_temp = sparql_temp.replace(/</g,'&lt');
    sparql_temp = sparql_temp.replace(/>/g,'&gt');
    sparql_temp = sparql_temp.replace(/dbr:/g,'<span class="hljs-code">dbr</span>:');
    sparql_temp = sparql_temp.replace(/dbo:/g,'<span class="hljs-code">dbo</span>:');
    sparql_temp = sparql_temp.replace(/dbp:/g,'<span class="hljs-code">dbp</span>:');
    sparql_temp = sparql_temp.replace(/rdf:/g,'<span class="hljs-code">rdf</span>:');
    sparql_temp = sparql_temp.replace(/rdfs:/g,'<span class="hljs-code">rdfs</span>:');
    sparql_temp = sparql_temp.replace(/xsd:/g,'<span class="hljs-code">xsd</span>:');
    sparql_temp = sparql_temp.replace(/\?path/g,'<span class="hljs-name">?path</span>');

    sparql_temp = sparql_temp.replace(/\?x/g,'<span class="hljs-name">?x</span>');
    sparql_temp = sparql_temp.replace(/\?y/g,'<span class="hljs-name">?y</span>');
    sparql_temp = sparql_temp.replace(/\?people/g,'<span class="hljs-name">?people</span>');

    sparql_temp = sparql_temp.replace(/SELECT/g,'<span class="hljs-link">SELECT</span>');
    sparql_temp = sparql_temp.replace(/PREFIX/g,'<span class="hljs-link">PREFIX</span>');
    sparql_temp = sparql_temp.replace(/WHERE/g,'<span class="hljs-link">WHERE</span>');
    sparql_temp = sparql_temp.replace(/OPTIONAL/g,'<span class="hljs-link">OPTIONAL</span>');
    sparql_temp = sparql_temp.replace(/\?peoples/g,'<span class="hljs-name">?peoples</span>');
    console.log(sparql_temp);
    //sparql_temp = sparql_temp.replace(/./g,'.\n');
    editor.classed( 'hide', false );
    this.dynamicContent = '<pre><code class="typescript highlight hljs">' + sparql_temp + '</code></pre>';
    
    console.log(captionField[0][0]);
    editor.select('#edit_code_cancle').on('click', cancelModal);
  }

  downloadResult() {
    const nodes = d3.selectAll('.image_test');
    let str_temp='';
    for (const node of nodes[0]) {
      //console.log(node.__data__.caption());
      str_temp += '<http://dbpedia.org/resource/' + node.__data__.caption()+ ">\n";
    }
    const FileSaver = require('file-saver'); 
    const blob = new Blob([str_temp], {type: 'text/plain;charset=utf-8'});
    FileSaver.saveAs(blob, 'Result.txt');
  }
}

$(function() {
  const optionsa = {items: [
    //{header: '第一个链接'},
    {text: 'Expand', onclick: expandNode},
    {text: 'Collapse', onclick: collapseNode},
    {text: 'Filter', onclick: filterNode },
    {text: 'Lock', onclick: lockNode },
    {text: 'Optional', onclick: lockNode },
    {text: 'Union', onclick: lockNode }
  ],
  menuId: 0};
  $('.node_circle').contextify(optionsa);
});

/*
*Define the structure of nodes
*include position, caption, imageurl, and results .etc
*/


const Node  = function() {
  let position = {x: 0, y: 0};
  let filter = '';
  let caption;
  let imageurl;
  let id;
  let result = null;
  const show = false;
  const variable = true;
  this.insideRadius = parameters.insideRadius;
  this.borderWidth = parameters.nodeStrokeWidth;
  this.arrowMargin = parameters.nodeStartMargin;
  this.x = function(x) {
    if (arguments.length === 1) {
      position.x = Number(x);
      return this;
  }
  return position.x;
  };

  this.filter = function(x) {
    if (arguments.length === 1) {
      filter = x;
      return this;
  }
  return filter;
  };

  this.result = function(nodes) {
    if (arguments.length === 1) {
      result = nodes;
      return this;
    }
    return result;
  };
  this.isLeftOf = function(node) {
    return this.x() < node.x();
  };

  this.angleTo = function(node) {
    const dx = node.x() - this.x();
    const dy = node.y() - this.y();
    return Math.atan2(dy, dx) * 180 / Math.PI;
  };
  this.y = function(y) {
    if (arguments.length === 1) {
      position.y = Number(y);
      return this;
  }
  return position.y;
  };
  this.id = function(x) {
    if (arguments.length === 1) {
      id = x;
      return this;
    }
    return id;
  };
  this.caption = function(captionText) {
    if (arguments.length === 1) {
      caption = captionText;
      return this;
    }
    return caption;
  };
  this.ex = function() {
    return position.x * dataset.internalScale;
  };

  this.ey = function() {
      return position.y * dataset.internalScale;
  };
  this.distanceTo = function(node) {
    const dx = node.x() - this.x();
    const dy = node.y() - this.y();
    return Math.sqrt(dx * dx + dy * dy) * dataset.internalScale;
};
  this.imageurl = function(imageText) {
      if (arguments.length === 1) {
        imageurl = imageText;
        return this;
      }
      return imageurl;
  };
  this.startRelationship = function() {
    return this.insideRadius + this.borderWidth + this.arrowMargin;
  };

  this.endRelationship = function() {
      return this.insideRadius + this.borderWidth + this.arrowMargin;
  };
};

/*
*Define the structure of relationship
*include predicate, arrow, startNode and endNode .etc
*@param start: start node
*@param end: end node
*@return relationship
*/
const Relationship = function(start, end) {
  let predicate = '';
  let id;
  this.sorce = 0;
  this.target = 0;
  this.start = start;
  this.end = end;
  const variable = true;
  this.id = function(x) {
    if (arguments.length === 1) {
      id = x;
      return this;
    }
    return id;
  };
  this.arrow = horizontalArrow( start, end, 0 );
  this.reverse = function() {
      const oldStart = this.start;
      this.start = this.end;
      this.end = oldStart;
  };

  this.predicate = function(text) {
    if (arguments.length === 1) {
      predicate = text;
      return this;
    }
    return predicate;
  };
};

/*
*Draw the relationship on the canvas
*@param start: start node
*@param end: end node
*@param predicate: caption of edges
*@return path
*/
function addRelationship(start, end, predicate) {
  const relation = new Relationship(start, end).id(start.id() + '_' + end.id()).predicate(predicate);
  if (predicate === '') {
    relation.variable = true;
  } else {
    relation.variable = false;
  }
  if (dataset.relationships.length === 0) {
    dataset.relationships.push(relation);
  } else {
    for (let x = 0; x < dataset.relationships.length; x++) {
      if ( dataset.relationships[x].id() !== relation.id()) {
        if (x === dataset.relationships.length - 1) {
          dataset.relationships.push(relation);
        }
      } else {
        break;
      }
    }
  }

  const relationship = d3.selectAll('#d3graph').selectAll('relationship.g').data([relation])
  .enter().append('g').attr('class', 'relationship_view')
  .attr('transform', function(r) {
    const angle = r.start.angleTo(r.end);
    return 'translate(' + r.start.ex() + ',' + r.start.ey() + ') rotate(' + angle + ')';
  });
  relationship.append('path')
    .attr('class', 'relationship overlay')
    .attr('fill', 'rgb(255, 255, 255)')
    .attr('id', function(d) {
      return 'id' + d.id();
    })
    .attr('stroke', 'rgb(0, 0, 0)')
    .attr('stroke-dasharray', function(d) {
      console.log('init_data');
      console.log(d);
      if (d.variable) {
        return '10';
      } else {
        return 'none';
      }
    })
    .attr('stroke-width', '3px')
    .attr('d', function(d) {
      console.log(d);
      return d.arrow.outline; } )
    .on( 'dblclick', editRelationship );
    /*.on('click', function(d, i) {
      const strdas = this.getAttribute('stroke-dasharray');
      if ( strdas === '10' ) {
        this.setAttribute('stroke-dasharray', 'none');
       } else {
        this.setAttribute('stroke-dasharray', '10'); }
    });*/
    if ( relation.end.isLeftOf(relation.start)) {
      relationship.append('text')
      .attr('class', 'type')
      .attr('transform', function(d) {
        console.log('rotateIfRightToLeft');
        return rotateIfRightToLeft(d);
      })
      .attr('text-anchor', 'middle')
      .attr('baseline-shift', '30%')
      .attr('alignment-baseline', 'alphabetic')
      .attr('x', function(d) { return side( d ) * d.arrow.apex.x; } )
      .attr('y', 0 )
      .attr( 'font-size', '50px')
      .attr( 'font-family', '"Gill Sans", "Gill Sans MT", Calibri, sans-serif')
      .text( function ( d ) { return  d.predicate(); } )
      .attr('transform', 'rotate(180)');
    } else {
      relationship.append('text')
      .attr('class', 'type')
      .attr('transform', function(d) {
        return rotateIfRightToLeft_force(d);
      })
      .attr('text-anchor', 'middle')
      .attr('baseline-shift', '30%')
      .attr('alignment-baseline', 'alphabetic')
      .attr('x', function(d) { return side( d ) * d.arrow.apex.x; } )
      .attr('y', 0 )
      .attr( 'font-size', '50px')
      .attr( 'font-family', '"Gill Sans", "Gill Sans MT", Calibri, sans-serif')
      .text( function ( d ) { return  d.predicate(); } )
      .attr('transform', null);
    }
}

function appendModalBackdrop() {
  d3.select( 'body' ).append( 'div' )
    .attr( 'class', 'modal-backdrop' )
    .on( 'click', cancelModal );
}

function cancelModal() {
  const editor = d3.selectAll( '.modal');
  if (editor[0][1].classList[3] !== 'hide') {
    editor.classed( 'hide', true );
    d3.selectAll( '.modal-backdrop' ).remove();
  } else if (editor[0][2].classList[3] !== 'hide') {
    editor.classed( 'hide', true );
    d3.selectAll( '.modal-backdrop' ).remove();
  } else if (editor[0][3].classList[3] !== 'hide') {
    editor.classed( 'hide', true );
    d3.selectAll( '.modal-backdrop' ).remove();
  } else if (editor[0][4].classList[3] !== 'hide'){
    editor.classed( 'hide', true );
    d3.selectAll( '.modal-backdrop' ).remove();
  }
}       

function createNode(x, y, z) {
  dataset.highestId += 1;
  const node = new Node().x(x).y(y).id(dataset.highestId - 1);
  console.log('node');
  console.log(node);
  dataset.nodes.push(node);

  
  if(z == 0){//按键创建新节点

  }else if(z == 1){//拖拽创建新节点

  }
  const images = d3.selectAll('#d3graph').selectAll('circle.g').data([node]);
  //console.log(dataset.nodes[dataset.highestId - 1]);
  const imagesss = images.enter().append('g').attr('class', 'image_test');
  //console.log(x, y);
  let tempId = 'id';
  imagesss.append('image').attr('class', 'image-class')
    .attr('href', '') //图片的链接网址
    .attr('x', function(d) {
      console.log(d);
      return d.x() - 75;
    })
    .attr('y', function(d) {
      return d.y() - 60;
    })
    .attr('height', '150')
    .attr('width', '150')
    .attr('clip-path', 'circle(60px at 75px 60px)')//用于将图片裁剪成圆形
    .attr('display', 'true');

    imagesss.append('circle')
    .attr('class', 'node_circle')
    .attr('stroke-dasharray', '15')
    .attr('id', function(d) {
      tempId = d.id();
      return 'id' + d.id();
    })
    .attr('r', function(d) {
      return 60;
    })
    .attr('stroke', 'rgb(0,0,0)')
    .attr('stroke-width', '8px')
    .attr('fill', 'rgba(255, 255, 255, 0)')
    .attr('cx', function(d) {
      return d.x();
    })
    .attr('cy', function(d) {
      return d.y();
    })
    .call(d3.behavior.drag().origin(dragCircle).on('drag', dragCircleMove))
    .on( 'dblclick', editnode);

    imagesss.append('circle')
    .attr('class', 'node ring')
    .attr('r', function(d) {
      return 65;
    })
    .attr('stroke', 'rgba(255,255,255,0)')
    .attr('stroke-width', '10px')
    .attr('fill', 'none')
    .attr('cx', function(d) {
      return node.x();
    })
    .attr('cy', function(d) {
      return d.y();
    })
    .call(d3.behavior.drag().origin(touchRing).on('drag', dragRingMove));

    imagesss.append('text')
    .attr('class', 2)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'central')
    .attr('x', function(d) {
      return d.x();
    })
    .attr('y', function(d) {
      return d.y() - 95;
    })
    .attr( 'fill', 'rgb(51,51,51)' )
    .attr( 'font-size', '50px')
    .attr( 'font-family', '\'Gill Sans\', \'Gill Sans MT\', Calibri, sans-serif')
    .text(function(d) {
      return d.caption();
    });
    const optionsa = {items: [
      //{header: '第一个链接'},
      {text: 'Expand', onclick: expandNode},
      {text: 'Collapse', onclick: collapseNode },
      {text: 'Filter', onclick: filterNode }
    ],
    menuId: tempId};
    $('.node_circle').contextify(optionsa);
    return images;
}

/*
*Draw the set of nodes on the canvas
*@param nodes: such as the result nodes
*@return g
*/
function drawNodes(nodes) {
  const images = d3.selectAll('#d3graph').selectAll('circle.g').data(nodes);
  const imagesss = images.enter().append('g').attr('class', 'image_test');

  let tempId = '';

  imagesss.append('image').attr('class', 'image-class')
    .attr('href', function(d) {
      return d.imageurl();
    })
    .attr('x', function(d) {
      return d.x() - 75;
    })
    .attr('y', function(d) {
      return d.y() - 60;
    })
    .attr('height', '150')
    .attr('width', '150')
    .attr('clip-path', 'circle(60px at 75px 60px)')
    .attr('display', 'true');

  imagesss.append('circle')
    .attr('class', 'node_circle')
    .attr('stroke-dasharray', function(d) {
      if (d.variable) {
        return '15';
      } else {
        return 'none';
      }
    })
    .attr('id', function(d) {
      tempId = d.id();
      return 'id' + d.id();
    })
    .attr('r', function(d) {
      return 60;
    })
    .attr('stroke', 'rgb(0,0,0)')
    .attr('stroke-width', '8px')
    .attr('fill', 'rgba(255, 255, 255, 0)')
    .attr('cx', function(d) {
      return d.x();
    })
    .attr('cy', function(d) {
      return d.y();
    })
    .call(d3.behavior.drag().origin(dragCircle).on('drag', dragCircleMove))
    .on( 'dblclick', editnode);

  imagesss.append('circle')
    .attr('class', 'node ring')
    .attr('r', function(d) {
      return 65;
    })
    .attr('stroke', 'rgba(255,255,255,0)')
    .attr('stroke-width', '10px')
    .attr('fill', 'none')
    .attr('cx', function(d) {
      return d.x();
    })
    .attr('cy', function(d) {
      return d.y();
    })
    .call(d3.behavior.drag().origin(touchRing).on('drag', dragRingMove));

  imagesss.append('text')
    .attr('class', 2)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'central')
    .attr('x', function(d) {
      return d.x();
    })
    .attr('y', function(d) {
      return d.y() - 95;
    })
    .attr( 'fill', 'rgb(51,51,51)' )
    .attr( 'font-size', '50px')
    .attr( 'font-family', '\'Gill Sans\', \'Gill Sans MT\', Calibri, sans-serif')
    .text(function(d) {
      return d.caption();
    });
    scaleZoom();
    const optionsa = {items: [
      //{header: '第一个链接'},
      {text: 'Expand', onclick: expandNode},
      {text: 'Collapse', onclick: collapseNode},
      {text: 'Filter', onclick: filterNode },
      {text: 'Lock', onclick: lockNode },
      {text: 'Optional', onclick: lockNode },
      {text: 'Union', onclick: lockNode }
    ],
    menuId: tempId};
    $('.node_circle').contextify(optionsa);
    return images;
}

/*
*The function of touch the node
*Get the position of node before move the node
*/
function dragCircle() {
  console.log('222');
  const t = d3.select(this);
  console.log(t[0][0].__data__.caption());
  return {
      x: t[0][0].parentElement.childNodes[1].getAttribute('cx'),
      y: t[0][0].parentElement.childNodes[1].getAttribute('cy'),
  };
}

/*
*The function of move the node
*Modify the position of node in real time
*Include the circle, image, ring, and relationship
*/
function dragCircleMove(d) {
  const node = d;
  const x = d3.event.x;
  const y = d3.event.y;

  if (!node.prototypePosition) {
    node.prototypePosition = {
      x: node.x(),
      y: node.y()
    };
  }
  node.prototypePosition.x += x / node.internalScale;
  node.prototypePosition.y += y / node.internalScale;
  node.x(x);
  node.y(y);
  const element = d3.select(this)[0][0].parentElement;
  // 圆
  element.childNodes[1].setAttribute('cx',  x );
  element.childNodes[1].setAttribute('cy',  y );
  // 圆环
  element.childNodes[2].setAttribute('cx',  x );
  element.childNodes[2].setAttribute('cy',  y );
  // 图片
  element.childNodes[0].setAttribute('x',  (parseInt(x, 10) - 75).toString());
  element.childNodes[0].setAttribute('y',  (parseInt(y, 10) - 60).toString() );
  const tempx = ((parseInt(x, 10)) * 0.001 + 75).toString();
  const tempy = ((parseInt(y, 10)) * 0.001 + 60).toString();
  element.childNodes[0].setAttribute('clip-path', 'circle(60px at ' + tempx + 'px ' + tempy + 'px)' );
  // 文字
  element.childNodes[3].setAttribute('x',  (parseInt(x, 10)).toString());
  element.childNodes[3].setAttribute('y',  (parseInt(y, 10) - 95).toString() );

  // 点的移动影响边
  const headNodes = getHeadNode(node);
  const tailNodes = getTailNode(node);
  console.log('cesh333');
  console.log(tailNodes);

  if ( headNodes.length !== 0 ) {
    for (const head of headNodes) {
      const outline = new Relationship(head, node);
      console.log('ceshi111');
      console.log(outline);
      const ship = d3.selectAll('#id' + head.id() + '_' + node.id());
      const angle = head.angleTo(node);
      if ( outline.end.isLeftOf(outline.start)) {
        ship[0][0].parentElement.childNodes[1].setAttribute('transform', 'rotate(180)');
      } else {
        ship[0][0].parentElement.childNodes[1].setAttribute('transform', null);
      }
      ship[0][0].setAttribute('d', outline.arrow.outline);
      ship[0][0].parentElement.childNodes[1].setAttribute('x', side( outline ) * outline.arrow.apex.x);
      ship[0][0].parentElement.setAttribute('transform', 'translate(' + head.ex() + ',' + head.ey() + ') rotate(' + angle + ')');
    }
  }

  if ( tailNodes.length !== 0 ) {
    for (const tail of tailNodes) {
      const outline = new Relationship(node, tail);
      console.log('ceshi111');
      const ship = d3.selectAll('#id' + node.id() + '_' + tail.id());
      if (ship[0].length !== 0) {
        const angle = node.angleTo(tail);
        if ( outline.end.isLeftOf(outline.start)) {
          ship[0][0].parentElement.childNodes[1].setAttribute('transform', 'rotate(180)');
        } else {
          ship[0][0].parentElement.childNodes[1].setAttribute('transform', null);
        }
        ship[0][0].setAttribute('d', outline.arrow.outline);
        ship[0][0].parentElement.childNodes[1].setAttribute('x', side( outline ) * outline.arrow.apex.x);
        ship[0][0].parentElement.setAttribute('transform', 'translate(' + node.ex() + ',' + node.ey() + ') rotate(' + angle + ')');
      }
    }
  }
  scaleZoom();
}

function dragRingMove(d) {
  const x = d3.event.x;
  const y = d3.event.y;
  const headNode = d;
  let tailNode = dataset.nodes[dataset.highestId - 1];
  if (tailNode.id() === headNode.id()) {
    return;
  }
  const tail = d3.selectAll('#id'  + tailNode.id())[0][0].parentElement;
  const relation = d3.selectAll('#id' + headNode.id() + '_' + tailNode.id());
  console.log('relation');
  console.log(dataset.relationships);

  if (!tailNode.prototypePosition) {
    tailNode.prototypePosition = {
      x: tailNode.x(),
      y: tailNode.y()
    };
  }
  tailNode.x(x);
  tailNode.y(y);
  //判断新点是否在旧点附近距离为650
  const allNodes = d3.selectAll('.node_circle')[0];
  allNodes.pop();
  let i = 1;
  for (const temp of allNodes) {
    console.log('第' + i + '次');
    if (temp.__data__ === headNode) {
      console.log('第' + i + '次');
      break;
    }
    if (temp.__data__ === tailNode) {
      console.log('第' + i + '次');
      break;
    }
    const xtemp = temp.__data__.x();
    const ytemp = temp.__data__.y();
    console.log('x' + x + 'y' + y + 'tempx' + xtemp + 'tempy' + ytemp);
    const distance = (x - xtemp) * (x - xtemp) + (y - ytemp) * (y - ytemp);
    console.log('第' + i + '次' + distance);
    i = i + 1;

    if (distance < 650) {
      console.log('删除点');
      console.log(tailNode.id());
      deletedNodeView(tailNode);
      tailNode = temp.__data__;
      console.log(relation[0][0].__data__.start.id() + '+' + relation[0][0].__data__.end.id());
      relation[0][0].parentElement.childNodes[1].setAttribute('id', 'id' + headNode.id() + '_' + tailNode.id());
      relation[0][0].setAttribute('id', 'id' + headNode.id() + '_' + tailNode.id());
      relation[0][0].__data__.end.id(tailNode.id());
      dataset.nodes.pop();
      dataset.highestId -= 1;
      console.log(dataset.relationships);
      let newRelationa = dataset.relationships.pop();
      newRelationa.end = tailNode;
      newRelationa.id(newRelationa.start.id() + '_' + newRelationa.end.id());
      dataset.relationships.push(newRelationa);
      console.log('newRelation');
      console.log(newRelationa.start.id() + '+' + newRelationa.end.id());
      console.log(dataset.relationships);
      // 圆
      tail.childNodes[1].setAttribute('cx',  tailNode.x() );
      tail.childNodes[1].setAttribute('cy',  tailNode.y() );
      // 圆环
      tail.childNodes[2].setAttribute('cx',  tailNode.x() );
      tail.childNodes[2].setAttribute('cy',  tailNode.y() );
      // 图片
      tail.childNodes[0].setAttribute('x',  (parseInt(tailNode.x(), 10) - 75).toString());
      tail.childNodes[0].setAttribute('y',  (parseInt(tailNode.y(), 10) - 60).toString() );
      const tempxa = ((parseInt(tailNode.x(), 10)) * 0.001 + 75).toString();
      const tempya = ((parseInt(tailNode.y(), 10)) * 0.001 + 60).toString();
      tail.childNodes[0].setAttribute('clip-path', 'circle(60px at ' + tempxa + 'px ' + tempya + 'px)' );
      // 文字
      tail.childNodes[3].setAttribute('x',  (parseInt(tailNode.x(), 10)).toString());
      tail.childNodes[3].setAttribute('y',  (parseInt(tailNode.y(), 10) - 95).toString() );
      // 点的移动影响边
      const outlinea = new Relationship(headNode, tailNode);
      console.log('dragRingMove111');
      console.log(outlinea);
      const anglea = headNode.angleTo(tailNode);
      if ( outlinea.end.isLeftOf(outlinea.start)) {
        relation[0][0].parentElement.childNodes[1].setAttribute('transform', 'rotate(180)');
      } else {
        relation[0][0].parentElement.childNodes[1].setAttribute('transform', null);
      }
      relation[0][0].setAttribute('d', outlinea.arrow.outline);
      relation[0][0].parentElement.childNodes[1].setAttribute('x', side( outlinea ) * outlinea.arrow.apex.x);
      relation[0][0].parentElement.setAttribute('transform', 'translate(' + headNode.ex() + ',' + headNode.ey() + ') rotate(' + anglea + ')');
      scaleZoom();
      return;
    } else {
      tailNode.prototypePosition.x += x / tailNode.internalScale;
      tailNode.prototypePosition.y += y / tailNode.internalScale;
      tailNode.x(x);
      tailNode.y(y);
    }
  }
  console.log(tailNode.x());
  // 圆
  tail.childNodes[1].setAttribute('cx',  tailNode.x() );
  tail.childNodes[1].setAttribute('cy',  tailNode.y() );
  // 圆环
  tail.childNodes[2].setAttribute('cx',  tailNode.x() );
  tail.childNodes[2].setAttribute('cy',  tailNode.y() );
  // 图片
  tail.childNodes[0].setAttribute('x',  (parseInt(tailNode.x(), 10) - 75).toString());
  tail.childNodes[0].setAttribute('y',  (parseInt(tailNode.y(), 10) - 60).toString() );
  const tempx = ((parseInt(tailNode.x(), 10)) * 0.001 + 75).toString();
  const tempy = ((parseInt(tailNode.y(), 10)) * 0.001 + 60).toString();
  tail.childNodes[0].setAttribute('clip-path', 'circle(60px at ' + tempx + 'px ' + tempy + 'px)' );
  // 文字
  tail.childNodes[3].setAttribute('x',  (parseInt(tailNode.x(), 10)).toString());
  tail.childNodes[3].setAttribute('y',  (parseInt(tailNode.y(), 10) - 95).toString() );
  // 点的移动影响边
  const outline = new Relationship(headNode, tailNode);
  console.log('dragRingMove111');
  console.log(outline);
  const angle = headNode.angleTo(tailNode);
  if ( outline.end.isLeftOf(outline.start)) {
    relation[0][0].parentElement.childNodes[1].setAttribute('transform', 'rotate(180)');
  } else {
    relation[0][0].parentElement.childNodes[1].setAttribute('transform', null);
  }
  relation[0][0].setAttribute('d', outline.arrow.outline);
  relation[0][0].parentElement.childNodes[1].setAttribute('x', side( outline ) * outline.arrow.apex.x);
  relation[0][0].parentElement.setAttribute('transform', 'translate(' + headNode.ex() + ',' + headNode.ey() + ') rotate(' + angle + ')');
  scaleZoom();
}

function deletedNodeView(node) {
  const temp = d3.selectAll('#id' + node.id())[0][0];
  if ( temp !== undefined) {
    temp.parentNode.parentNode.removeChild(temp.parentNode);
  }
  scaleZoom();
}

function deleteShip(start, end) {
  const ship = new Relationship(start, end);
  const index = dataset.relationships.indexOf(ship);
  dataset.relationships.splice(index, 1);
}

function deletedShipView(node) {
  const head = getHeadNode(node);
  const tail = getTailNode(node);
  for (const x of head) {
    const temp = d3.selectAll('#id' + x.id() + '_' + node.id())[0][0];
    if ( temp !== undefined) {
      temp.parentNode.parentNode.removeChild(temp.parentNode);
    }
    // deleteShip(x, node);
  }
  for (const y of tail) {
    const temp = d3.selectAll('#id' + node.id() + '_' + y.id())[0][0];
    console.log('ttttttttttttttttttemp');
    console.log(temp);
    if ( temp !== undefined) {
      temp.parentNode.parentNode.removeChild(temp.parentNode);
      deletedNodeView(y);
      deletedShipView(y);
    }
  }
    // deleteShip(node, x);
}

function collapseNode() {
  console.log('doubleclick');
  let temp = d3.select(this)[0][0];
  if ( temp.tagName === 'A') {
    temp = d3.selectAll('#id' + temp.parentNode.parentNode.id)[0][0];
  }
  if (temp.__data__.show) {
    const nodes = temp.__data__.result();
    for (const x of nodes) {
      deletedNodeView(x);
      deletedShipView(x);
    }
    temp.__data__.show = false;
  }
}

function expandNode() {
  const r = 800;
  let temp = d3.select(this)[0][0];
  if ( temp.tagName === 'A') {
    temp = d3.selectAll('#id' + temp.parentNode.parentNode.id)[0][0];
  }
  if (!temp.__data__.show) {
    console.log('expandnode');
    const heads = getHeadNode(temp.__data__);
    const nodes = temp.__data__.result();
    for (let x = 1; x < nodes.length + 1; x++) {
      if (x % 2 === 1) {
        const tempi = (x + 1) / 2;
        const tempx = heads[0].x() + r * Math.cos(2 * 3.141592653 * tempi / 27);
        const tempy = heads[0].y() + r * Math.sin(2 * 3.141592653 * tempi / 27);
        nodes[x - 1].x(tempx).y(tempy);
      } else {
        const tempi = x / 2;
        const tempx = heads[0].x() + r * Math.cos(2 * 3.141592653 * tempi / 27);
        const tempy = heads[0].y() - r * Math.sin(2 * 3.141592653 * tempi / 27);
        nodes[x - 1].x(tempx).y(tempy);
      }
      for (const y of heads) {
        const predicate = findRelationById(y.id() + '_' + temp.__data__.id()).predicate();
        addRelationship(y, nodes[x - 1], predicate);
      }
    }
    temp.__data__.show = true;
    drawNodes(temp.__data__.result());
    console.log(dataset.nodes);
  }
}

function editnode() {
  const r = 800;
  let temp = d3.select(this)[0][0];
  if ( temp.tagName === 'A') {
    temp = d3.selectAll('#id' + temp.parentNode.parentNode.id)[0][0];
  }
  console.log(temp.__data__);
  const tempvalue = temp.parentElement;
  const editor = d3.select('.pop-up-editor.node');//d3.select('.pop-up-editor.node').select('#node_properties').node().value;
  const captionField = editor.select('#node_caption');
  captionField.node().value = tempvalue.childNodes[3].innerHTML || '';
  if (temp.__data__.result() === null) {// 如果结果为空
    appendModalBackdrop();
    editor.classed( 'hide', false );
    captionField[0][0].parentElement.childNodes[0].focus();
    editor.select('#edit_node_cancle').on('click', cancelModal);
    editor.select('#edit_node_save').on('click', saveModal);
    editor.select('#edit_node_delete').on('click', deleteModal);
  } else {// 如果结果不为空
    if (!temp.__data__.show) {// 如果结果没有展开
      console.log('xxxxxxxx');
      const heads = getHeadNode(temp.__data__);
      const nodes = temp.__data__.result();
      //console.log(heads.length == 0);
      let temp_x = 0;
      let temp_y = 0;
      if(heads.length == 0){
        temp_x = 0;
        temp_y = 0;
      }else {
        temp_x = heads[0].x();
        temp_y = heads[0].y();
      }
      for (let x = 1; x < nodes.length + 1; x++) {
        if (x % 2 === 1) {
          const tempi = (x + 1) / 2;
          const tempx = temp_x + r * Math.cos(2 * 3.141592653 * tempi / 27);
          const tempy = temp_y + r * Math.sin(2 * 3.141592653 * tempi / 27);
          nodes[x - 1].x(tempx).y(tempy);
        } else {
          const tempi = x / 2;
          const tempx = temp_x + r * Math.cos(2 * 3.141592653 * tempi / 27);
          const tempy = temp_y - r * Math.sin(2 * 3.141592653 * tempi / 27);
          nodes[x - 1].x(tempx).y(tempy);
        }
        for (const y of heads) {
          const predicate = findRelationById(y.id() + '_' + temp.__data__.id()).predicate();
          addRelationship(y, nodes[x - 1], predicate);
        }
      }
      temp.__data__.show = true;
      drawNodes(temp.__data__.result());
      console.log(dataset.nodes);
    } else {// 如果结果展开
      console.log('doubleclick');
      const nodes = temp.__data__.result();
      for (const x of nodes) {
        deletedNodeView(x);
        deletedShipView(x);
      }
      temp.__data__.show = false;
    }
  }
  function saveModal() {//Search
    tempvalue.__data__.caption(captionField.node().value);
    let tempNumber = 0;
    let type = d3.select('.pop-up-editor.node').select('#node_type').node().value;
    if (tempvalue.__data__.caption() !== '') {
      tempvalue.__data__.variable = false;
      tempvalue.childNodes[1].setAttribute('stroke-dasharray', 'none');
      console.log(tempvalue.__data__.caption());
      tempvalue.childNodes[3].innerHTML = captionField.node().value;
      const person_name = captionField.node().value;
      sparql = dbr + dbo + dbp + 'SELECT ?path WHERE {dbr:' + person_name + ' dbo:thumbnail ?path.}';
      d3sparql.query(endpoint, sparql, render);
    } else {
      tempvalue.childNodes[0].setAttribute('href', '');
      if (type !== '') {
        tempNumber = 1;
        tempvalue.__data__.variable = true;
        tempvalue.childNodes[1].setAttribute('stroke-dasharray', '15');
        sparql = dbr + rdf + rdfs + dbo + dbp + ' SELECT distinct ?people ?path WHERE { ?people rdf:type dbo:' + type + '. optional {?people dbo:thumbnail ?path.}} LIMIT 20';
        d3sparql.query(endpoint, sparql, render);
        console.log('endquery');
      }
    }
    function render(json, bug) {
      if ( json != null && json.results.bindings.length !== 0 ) {// 请求成功
        console.log('111111');
        if(tempNumber == 0){
          const uri = json.results.bindings[0].path.value;
          tempvalue.childNodes[0].setAttribute('href', uri);
          console.log(uri);
        }else if(tempNumber == 1){
          console.log('111111');
          console.log(json.results);
          let length_temp = json.results.bindings.length;
          
          if(length_temp == 10000){
            sparql = dbr + rdf + rdfs + dbo + dbp + ' SELECT (count(?x) as ?count) WHERE { ?x rdf:type dbo:' + type + '.} LIMIT 20';
            d3sparql.query(endpoint, sparql, render);
          }else{
            if(length_temp == 1){
              tempvalue.childNodes[3].innerHTML = 'List ' + json.results.bindings[0].count.value;
            }else {
              tempvalue.childNodes[3].innerHTML = 'List ' + length_temp;
              const nodes = [];
              for (const x of json.results.bindings) {
                const temp = new Node();
                temp.caption(x.people.value.slice(28));
                if (x.path !== undefined) {
                  temp.imageurl(x.path.value);
                  console.log(x.path.value)
                }
                temp.id(dataset.highestId);
                dataset.highestId += 1;
                nodes.push(temp);
                dataset.nodes.push(temp);
              }
              if (length !== 1) {
                temp.__data__.result(nodes);
              }
            }
            
          }

          ////var str=json.results.bindings;
  
          ////let str_temp='';
          
          //var w = window.open();
          //w.document.open("text","utf-8");
          //w.document.charset = 'UTF-8';
          ////for(var i=0;i<str.length;i++){
            //w.document.write(str[i].x.value+ "<br />");
            //str_temp += str[i].x.value+ "\n"
          
          ////}
          ////const FileSaver = require('file-saver'); 
          ////const blob = new Blob([str_temp], {type: 'text/plain;charset=utf-8'});
          ////FileSaver.saveAs(blob, 'DBpedia.txt');
          ////console.log('DBpedia.txt');
          //w.document.execCommand("SaveAs", true,  number + "-" + number+49999 + ".txt");
     

        }
      } else { // 请求失败
        console.log('111111');
        tempvalue.childNodes[0].setAttribute('href', '');
      }
    }
    cancelModal();
  }
  function deleteModal() {
    deletedNodeView(temp.__data__);
    deletedShipView(temp.__data__);
    cancelModal();
  }
}

function lockNode() {
}
function filterNode() {
  let tempvalue = d3.select(this)[0][0];
  if ( tempvalue.tagName === 'A') {
    tempvalue = d3.selectAll('#id' + tempvalue.parentNode.parentNode.id)[0][0];
  }
  const editor = d3.select('.pop-up-editor.filter');
  appendModalBackdrop();
  editor.classed( 'hide', false );
  const filterType = editor.select('#filter_properties');
  filterType[0][0].parentElement.childNodes[0].focus();
  console.log(tempvalue.__data__);
  filterType.node().value = tempvalue.__data__.filter() || '';

  editor.select('#edit_filter_cancle').on('click', cancelModal);
  editor.select('#edit_filter_save').on('click', saveModal);

  function saveModal() {
    const filter = filterType.node().value;
    console.log(filter);
    tempvalue.__data__.filter(filter);
    const filtera = filter.split('>')[0];
    const filterb = filter.split('>')[1];
    console.log(filter);
    const nodes = tempvalue.__data__.result();
    let subject = '';
    let sparqltext = 'SELECT distinct ?x ?path WHERE {';
    if (nodes !== null) {
      console.log(nodes);
      subject = 'VALUES ?x {';
     for (const x of nodes) {
       subject += 'dbr:' + x.caption() + ' ';
     }
     subject += '} ?x';
   } else {
      //subject = 'dbr:' + nodes.caption();
   }
   sparqltext += subject + ' dbo:' + filtera + ' ?peoples. optional {?x dbo:thumbnail ?path.} filter(?peoples>\"' + filterb + '-01-01\"^^xsd:date)}';
   sparql = dbr + dbo + dbp + xsd + sparqltext;
   console.log(sparql);
   const newNodes = [];
   d3sparql.query(endpoint, sparql, render);
   function render(json) {
     console.log(json);
     if ( json !== undefined && json.results.bindings.length !== 0) {// 请求成功
      const length = json.results.bindings.length;
      const text = d3.selectAll('#id' + tempvalue.__data__.id())[0][0];
      if (length === 1) {
        if (json.results.bindings[0].x.value.substr(0, 28) === 'http://dbpedia.org/resource/') {
            tempvalue.__data__.caption(json.results.bindings[0].x.value.slice(28));
            if (json.results.bindings[0].path !== undefined) {
              tempvalue.__data__.imageurl(json.results.bindings[0].path.value);
              text.parentElement.childNodes[0].setAttribute('href', json.results.bindings[0].path.value);
            }
            text.parentElement.childNodes[3].innerHTML = json.results.bindings[0].x.value.slice(28);
          } else {
            tempvalue.__data__.caption(json.results.bindings[0].x.value);
            text.parentElement.childNodes[3].innerHTML = json.results.bindings[0].x.value;
          }
          tempvalue.__data__.result(null);
          text.parentElement.childNodes[1].setAttribute('stroke-dasharray', 'none');
      } else {
        tempvalue.__data__.caption('List ' + length);
        text.parentElement.childNodes[3].innerHTML = 'List ' + length;
        for (const x of json.results.bindings) {
          const temp = new Node();
          temp.caption(x.x.value.slice(28));
          if (x.path !== undefined) {
            temp.imageurl(x.path.value);
          }
          newNodes.push(temp);
        }
        tempvalue.__data__.result(newNodes);
      }
    } else {
      tempvalue.__data__.caption('NULL');
      const text = d3.selectAll('#id' + tempvalue.__data__.id())[0][0];
      text.parentElement.childNodes[3].innerHTML = 'NULL';
      tempvalue.__data__.result(null);
      text.parentElement.childNodes[1].setAttribute('stroke-dasharray', '15');
    }
   }
    cancelModal();
  }
}

function editRelationship() {
  const tempvalue = d3.select(this)[0][0];
  const editor = d3.select('.pop-up-editor.relationship');
  appendModalBackdrop();
  editor.classed( 'hide', false );
  const captionField = editor.select('#relationship_type');
  captionField[0][0].parentElement.childNodes[0].focus();
  captionField.node().value = tempvalue.parentElement.childNodes[1].innerHTML || '';

  function saveModal() {
    let predicate = captionField.node().value;
    tempvalue.__data__.predicate(predicate);
    if (tempvalue.__data__.predicate() !== '') {
      tempvalue.__data__.variable = false;
      tempvalue.parentElement.childNodes[0].setAttribute('stroke-dasharray', 'none');
    } else {
      tempvalue.__data__.variable = true;
      tempvalue.parentElement.childNodes[0].setAttribute('stroke-dasharray', '10');
    }
    let subject = '';
    //console.log('获取头实体集合');
    //console.log(getHeadNode(tempvalue.__data__.end));
    const headNodes = getHeadNode(tempvalue.__data__.end);
    //console.log('获取入边谓语');
    //const temmp = dataset.relationships.pop();
    //console.log(temmp.id());
    //dataset.relationships.push(temmp);
    let sparqltext = 'SELECT ?peoples ?path WHERE {';
    for (const temp of headNodes) {

      predicate = findRelationById(temp.id() + '_' + tempvalue.__data__.end.id()).predicate();
     // console.log(findRelationById(temp.id() + '_' + tempvalue.__data__.end.id()).predicate());
      if (temp.result() !== null) {
        subject = 'VALUES ?x {';
       for (const x of temp.result()) {
         if (x.caption().indexOf("\'") == -1){
          subject += 'dbr:' + x.caption() + ' ';
         }
         
       }
       subject += '} ?x';
     } else {
        subject = 'dbr:' + temp.caption();
     }
     sparqltext += subject + ' dbo:' + predicate + ' ?peoples.';
    }
    sparqltext += 'OPTIONAL {?peoples dbo:thumbnail ?path.}}';
    tempvalue.parentElement.childNodes[1].innerHTML = captionField.node().value;
    //const sparqltext = 'SELECT ?peoples ?path WHERE {' + subject + ' dbo:' + predicate + ' ?peoples. OPTIONAL {?peoples dbo:thumbnail ?path.}}';
    console.log(sparqltext);
    sparql = dbr + dbo + dbp + sparqltext;
    d3sparql.query(endpoint, sparql, render);
    function render(json) {
      console.log(json);
      const node = tempvalue.__data__.end;
      const nodes = [];
      if ( json !== undefined && json.results.bindings.length !== 0) {// 请求成功
        console.log(json);
        const length = json.results.bindings.length;
        const text = d3.selectAll('#id' + tempvalue.__data__.end.id())[0][0];
        if (length === 1) {
          if (json.results.bindings[0].peoples.value.substr(0, 28) === 'http://dbpedia.org/resource/') {
            tempvalue.__data__.end.caption(json.results.bindings[0].peoples.value.slice(28));
            if (json.results.bindings[0].path !== undefined) {
              tempvalue.__data__.end.imageurl(json.results.bindings[0].path.value);
              text.parentElement.childNodes[0].setAttribute('href', json.results.bindings[0].path.value);
            }
            text.parentElement.childNodes[3].innerHTML = json.results.bindings[0].peoples.value.slice(28);
          } else {
            tempvalue.__data__.end.caption(json.results.bindings[0].peoples.value);
            text.parentElement.childNodes[3].innerHTML = json.results.bindings[0].peoples.value;
          }
          text.parentElement.childNodes[1].setAttribute('stroke-dasharray', 'none');
        } else {
          tempvalue.__data__.end.caption('List ' + length);
          text.parentElement.childNodes[3].innerHTML = 'List ' + length;
          text.parentElement.childNodes[1].setAttribute('stroke-dasharray', '15');
          text.parentElement.childNodes[0].setAttribute('href', '');
        }
        for (const x of json.results.bindings) {
          const temp = new Node();
          temp.caption(x.peoples.value.slice(28));
          if (x.path !== undefined) {
            temp.imageurl(x.path.value);
          }
          temp.id(dataset.highestId);
          dataset.highestId += 1;
          nodes.push(temp);
          dataset.nodes.push(temp);
        }
        if (length !== 1) {
          node.result(nodes);
        }
      } else {// 请求失敗
        tempvalue.__data__.end.caption('NULL');
        const text = d3.selectAll('#id' + tempvalue.__data__.end.id())[0][0];
        text.parentElement.childNodes[3].innerHTML = 'NULL';
        text.parentElement.childNodes[1].setAttribute('stroke-dasharray', '15');
        text.parentElement.childNodes[0].setAttribute('href', '');
        node.result(null);
      }
      cancelModal();
    }
  }
  editor.select('#edit_relationship_cancle').on('click', cancelModal);
  editor.select('#edit_relationship_save').on('click', saveModal);
}

function findRelationById(id) {
  for (const x of dataset.relationships) {
    if (x.id() === id) {
      return x;
    }
  }
}

function getHeadNode(node) {
  const headNodes = [];
  for (const x of dataset.relationships) {
    if ( x.end.id() === node.id() ) {
      headNodes.push(x.start);
    }
  }
  return headNodes;
}

function getRelationShip(start, end) {
  for (const x of dataset.relationships) {
    if ( x.start.id() === start.id() && x.end.id() === end.id()) {
      return x;
    }
  }
}

function getTailNode(node) {
  const tailNodes = [];
  for (const x of dataset.relationships) {
    console.log(x.start.id() + '+' + x.end.id());
    if ( x.start.id() === node.id()) {
      tailNodes.push(x.end);
    }
  }
  return tailNodes;
}

function rotateIfRightToLeft(r) {
  return r.end.isLeftOf( r.start ) ? ' ' : null;
}

function rotateIfRightToLeft_force(r) {
  return r.end.x > r.start.x ? ' ' : null;
}

function snap(position, field, node ) {
  const ideal = position[field];
  let closestNode;
  let closestDistance = Number.MAX_VALUE;
  for (const nodeId in dataset.nodes) {
      if (dataset.nodes.hasOwnProperty(nodeId)) {
        const candidateNode = dataset.nodes[nodeId];
          if ( candidateNode !== node ) {
            const distance = Math.abs(candidateNode[field]() - ideal);
              if (distance < closestDistance) {
                  closestNode = candidateNode;
                  closestDistance = distance;
              }
          }
      }
  }
  if (closestDistance < 20) {
      return closestNode[field]();
  } else {
      return position[field];
  }
}

function side(r) {
  return r.end.isLeftOf(r.start) ? -1 : 1;
}

function side_force(r) {
  return r.end.x > r.start.x ? -1 : 1;
}
//
function touchRing(d) {
  console.log('333');
  const t = d3.select(this);
  const node = createNode(parseInt(t[0][0].getAttribute('cx'), 10), parseInt(t[0][0].getAttribute('cy'), 10), 1);
  const ship = addRelationship(d, node[0][0].__data__, '');
  return {
    x: t[0][0].parentElement.childNodes[1].getAttribute('cx'),
    y: t[0][0].parentElement.childNodes[1].getAttribute('cy'),
};
}

// 计算边的路径
function horizontalArrow( start, end, offset) {
  const length = start.distanceTo(end);
  const arrowWidth = parsePixels('8px');
  console.log('1');
  console.log(length);
  if (offset === 0) {
      return horizontalArrowOutline(
          start.startRelationship(),
          (length - end.endRelationship()),
          arrowWidth );
  }
}

// 计算边的路径--力学
function horizontalArrow_force( start, end, offset) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy) * dataset.internalScale;
  const arrowWidth = parsePixels('8px');
  console.log('1');
  console.log(length);
  if (offset === 0) {
      return horizontalArrowOutline(
          start.startRelationship(),
          (length - end.endRelationship()),
          arrowWidth );
  }
}

function parsePixels(fontSize) {
  return parseFloat( fontSize.slice( 0, -2 ) );
}

function horizontalArrowOutline(start, end, arrowWidth) {
  const shaftRadius = arrowWidth / 2;
  const headRadius = arrowWidth * 2;
  const headLength = headRadius * 2;
  const shoulder = start < end ? end - headLength : end + headLength;
  return {
      outline: [
          'M', start, shaftRadius,
          'L', shoulder, shaftRadius,
          'L', shoulder, headRadius,
          'L', end, 0,
          'L', shoulder, -headRadius,
          'L', shoulder, -shaftRadius,
          'L', start, -shaftRadius,
          'Z'
      ].join(' '),
      apex: {
          x: start + (shoulder - start) / 2,
          y: 0
      }
  };
}

function curvedArrowOutline(startRadius, endRadius, endCentre, minOffset, arrowWidth, headWidth, headLength) {
  let startAttach, endAttach, offsetAngle;

  function square( l ) {
      return l * l;
  }

  const radiusRatio = startRadius / (endRadius + headLength);
  const homotheticCenter = -endCentre * radiusRatio / (1 - radiusRatio);

  function intersectWithOtherCircle(fixedPoint, radius, xCenter, polarity) {
    const gradient = fixedPoint.y / (fixedPoint.x - homotheticCenter);
    const hc = fixedPoint.y - gradient * fixedPoint.x;

    const A = 1 + square(gradient);
    const B = 2 * (gradient * hc - xCenter);
    const C = square(hc) + square(xCenter) - square(radius);

    const intersection = { x: (-B + polarity * Math.sqrt( square( B ) - 4 * A * C )) / (2 * A), y: 0 };
    intersection.y = (intersection.x - homotheticCenter) * gradient;

    return intersection;
  }

  if (endRadius + headLength > startRadius) {
    offsetAngle = minOffset / startRadius;
    startAttach = {
        x: Math.cos( offsetAngle ) * (startRadius),
        y: Math.sin( offsetAngle ) * (startRadius)
    };
    endAttach = intersectWithOtherCircle( startAttach, endRadius + headLength, endCentre, -1 );
  } else {
      offsetAngle = minOffset / endRadius;
      endAttach = {
          x: endCentre - Math.cos( offsetAngle ) * (endRadius + headLength),
          y: Math.sin( offsetAngle ) * (endRadius + headLength)
      };
      startAttach = intersectWithOtherCircle( endAttach, startRadius, 0, 1 );
    }
  const
    g1 = -startAttach.x / startAttach.y,
    c1 = startAttach.y + (square( startAttach.x ) / startAttach.y),
    g2 = -(endAttach.x - endCentre) / endAttach.y,
    c2 = endAttach.y + (endAttach.x - endCentre) * endAttach.x / endAttach.y;

  const cx = ( c1 - c2 ) / (g2 - g1);
  const cy = g1 * cx + c1;

  const arcRadius = Math.sqrt(square(cx - startAttach.x) + square(cy - startAttach.y));

  function startTangent(dr) {
    const dx = (dr < 0 ? -1 : 1) * Math.sqrt(square(dr) / (1 + square(g1)));
    const dy = g1 * dx;
    return [
        startAttach.x + dx,
        startAttach.y + dy
    ].join(',');
  }

  function endTangent(dr) {
    const dx = (dr < 0 ? -1 : 1) * Math.sqrt(square(dr) / (1 + square(g2)));
    const dy = g2 * dx;
    return [
        endAttach.x + dx,
        endAttach.y + dy
    ].join(',');
  }

  function endNormal(dc) {
    const dx = (dc < 0 ? -1 : 1) * Math.sqrt(square(dc) / (1 + square(1 / g2)));
    const dy = dx / g2;
    return [
        endAttach.x + dx,
        endAttach.y - dy
    ].join(',');
  }

  const shaftRadius = arrowWidth / 2;
  const headRadius = headWidth / 2;

  return {
    outline: [
        'M', startTangent(-shaftRadius),
        'L', startTangent(shaftRadius),
        'A', arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, minOffset > 0 ? 0 : 1, endTangent(-shaftRadius),
        'L', endTangent(-headRadius),
        'L', endNormal(headLength),
        'L', endTangent(headRadius),
        'L', endTangent(shaftRadius),
        'A', arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, minOffset < 0 ? 0 : 1, startTangent(-shaftRadius)
    ].join( ' ' ),
    apex: {
        x: cx,
        y: cy > 0 ? cy - arcRadius : cy + arcRadius
    }
  };
}

function scaleZoom() {
  const svg = d3.selectAll('.graphdiagram');
  let xAvg = 0;
  let yAvg = 0;
  let xMax = 400;
  let xMin = -400;
  let yMax = 400;
  let yMin = -400;
  const nodesView = d3.selectAll('circle.node_circle')[0];
  const nodes = [];
  for (const y of nodesView) {
    nodes.push(y.__data__);
  }
  for (const x of nodes) {
    if (x.x() > xMax) {
      xMax = x.x();
    }
    if (x.x() < xMin) {
      xMin = x.x();
    }
    if (x.y() > yMax) {
      yMax = x.y();
    }
    if (x.y() < yMin) {
      yMin = x.y();
    }
    xAvg = xAvg + x.x();
    yAvg = yAvg + x.y();
  }
  xAvg = xAvg / (dataset.highestId - 1);
  yAvg = yAvg / (dataset.highestId - 1);
  xMax = xMax + 100;
  xMin = xMin - 100;
  yMax = yMax + 100;
  yMin = yMin - 150;
  const viewBox = xMin.toString() + ', ' + yMin.toString() + ', ' + (xMax - xMin).toString() + ', ' + (yMax - yMin).toString();
  svg[0][0].setAttribute('viewBox', viewBox);
}

function scaleZoom_force() {
  const svg = d3.selectAll('.graphdiagram_force');
  let xAvg = 0;
  let yAvg = 0;
  let xMax = 400;
  let xMin = -400;
  let yMax = 400;
  let yMin = -400;
  const nodesView = d3.selectAll('circle.node_circle')[0];
  const nodes = [];
  for (const y of nodesView) {
    nodes.push(y.__data__);
  }
  for (const x of nodes) {
    if (x.x > xMax) {
      xMax = x.x;
    }
    if (x.x < xMin) {
      xMin = x.x;
    }
    if (x.y > yMax) {
      yMax = x.y;
    }
    if (x.y < yMin) {
      yMin = x.y;
    }
    xAvg = xAvg + x.x;
    yAvg = yAvg + x.y;
  }
  xAvg = xAvg / (dataset.highestId - 1);
  yAvg = yAvg / (dataset.highestId - 1);
  xMax = xMax + 100;
  xMin = xMin - 100;
  yMax = yMax + 100;
  yMin = yMin - 150;
  const viewBox = xMin.toString() + ', ' + yMin.toString() + ', ' + (xMax - xMin).toString() + ', ' + (yMax - yMin).toString();
  svg[0][0].setAttribute('viewBox', viewBox);
}

import { Component, OnInit, ElementRef} from '@angular/core';
declare var $;
declare var d3;
declare var d3sparql;
const endpoint = 'https://dbpedia.org/sparql';
const dbr = 'PREFIX dbr:<http://dbpedia.org/resource/> ';
const dbo = 'PREFIX dbo:<http://dbpedia.org/ontology/> ';
const dbp = 'PREFIX dbp:<http://dbpedia.org/property/> ';
const rdf = 'PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>';
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

  constructor(
    private el: ElementRef
  ) { }

  labelChanged(e) {
    const keycode = window.event ? e.keyCode : e.which;
    if (keycode === 13) {// 回车键

    }
  }

  predicateChanged(e) {
    const keycode = window.event ? e.keyCode : e.which;
    if (keycode === 13) {// 回车键

    }
  }

  ngOnInit() {
    dataset.highestId += 1;
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
              return 0;
            }
            const sparql = dbr + dbo + dbp + rdf + ' SELECT ?person WHERE {?person rdf:type dbo:Person. FILTER( regex ((?person), \'' + request.term.toString() + '\' ))} LIMIT 20';
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
          'birthYear'
        ];
        $( 'input#relationship_type' ).autocomplete({
            minChars: 3,
            source: tags
        });
      });
    }

  onClick() {
    createNode(0, 100);
  }
}

const Node  = function() {
  let position = {x: 0, y: 0};
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

const Relationship = function(start, end) {
  let predicate = '';
  let id;
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
  const relationship = d3.selectAll('#d3graph').selectAll('relationship.g')
  .data([relation]).enter().append('g').attr('class', 'relationship')
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
      .attr('transform', null);
    }
}

function appendModalBackdrop() {
  d3.select( 'body' ).append( 'div' )
    .attr( 'class', 'modal-backdrop' )
    .on( 'click', cancelModal );
}

function cancelModal() {
  d3.selectAll( '.modal').classed( 'hide', true );
  d3.selectAll( '.modal-backdrop' ).remove();
}

function createNode(x, y) {
  dataset.highestId += 1;
  const node = new Node().x(x).y(y).id(dataset.highestId - 1);
  console.log('node');
  console.log(node);
  dataset.nodes.push(node);
  const images = d3.selectAll('#d3graph').selectAll('circle.g').data([node]);
  console.log(dataset.nodes[dataset.highestId - 1]);
  const imagesss = images.enter().append('g').attr('class', 'image_test');
  console.log(x, y);

  imagesss.append('image').attr('class', 'image-class')
    .attr('href', '')
    .attr('x', function(d) {
      console.log(d);
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
    .attr('stroke-dasharray', '15')
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
    return images;
}

function drawNodes(nodes) {
  const images = d3.selectAll('#d3graph').selectAll('circle.g').data(nodes);
  const imagesss = images.enter().append('g').attr('class', 'image_test');
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
    return images;
}

function dragCircle() {
  console.log('222');
  const t = d3.select(this);
  console.log(t[0][0].parentElement);
  return {
      x: t[0][0].parentElement.childNodes[1].getAttribute('cx'),
      y: t[0][0].parentElement.childNodes[1].getAttribute('cy'),
  };
}

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
  scaleZoom();
}

function dragRingMove(d) {
  const x = d3.event.x;
  const y = d3.event.y;
  const headNode = d;
  const tailNode = dataset.nodes[dataset.highestId - 1];
  const tail = d3.selectAll('#id'  + tailNode.id())[0][0].parentElement;
  const relation = d3.selectAll('#id' + headNode.id() + '_' + tailNode.id());
  if (!tailNode.prototypePosition) {
    tailNode.prototypePosition = {
      x: tailNode.x(),
      y: tailNode.y()
    };
  }
  tailNode.prototypePosition.x += x / tailNode.internalScale;
  tailNode.prototypePosition.y += y / tailNode.internalScale;
  tailNode.x(x);
  tailNode.y(y);
  // 圆
  tail.childNodes[1].setAttribute('cx',  x );
  tail.childNodes[1].setAttribute('cy',  y );
  // 圆环
  tail.childNodes[2].setAttribute('cx',  x );
  tail.childNodes[2].setAttribute('cy',  y );
  // 图片
  tail.childNodes[0].setAttribute('x',  (parseInt(x, 10) - 75).toString());
  tail.childNodes[0].setAttribute('y',  (parseInt(y, 10) - 60).toString() );
  const tempx = ((parseInt(x, 10)) * 0.001 + 75).toString();
  const tempy = ((parseInt(y, 10)) * 0.001 + 60).toString();
  tail.childNodes[0].setAttribute('clip-path', 'circle(60px at ' + tempx + 'px ' + tempy + 'px)' );
  // 文字
  tail.childNodes[3].setAttribute('x',  (parseInt(x, 10)).toString());
  tail.childNodes[3].setAttribute('y',  (parseInt(y, 10) - 95).toString() );
  // 点的移动影响边
  const outline = new Relationship(headNode, tailNode);
  console.log('ceshi111');
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

function editnode() {
  const r = 800;
  console.log(d3.select(this)[0][0].__data__.result());
  console.log(d3.select(this));
  const temp = d3.select(this)[0][0];
  const tempvalue = temp.parentElement;
  const editor = d3.select('.pop-up-editor.node');
  const captionField = editor.select('#node_caption');
  captionField.node().value = tempvalue.childNodes[3].innerHTML || '';
  if (d3.select(this)[0][0].__data__.result() === null) {// 如果结果为空
    // appendModalBackdrop();
    editor.classed( 'hide', false );
    captionField[0][0].parentElement.childNodes[0].focus();
    editor.select('#edit_node_cancle').on('click', cancelModal);
    editor.select('#edit_node_save').on('click', saveModal);
    editor.select('#edit_node_delete').on('click', deleteModal);
  } else {// 如果结果不为空
    if (!d3.select(this)[0][0].__data__.show) {// 如果结果没有展开
      console.log('xxxxxxxx');
      const head = getHeadNode(d3.select(this)[0][0].__data__);
      const nodes = d3.select(this)[0][0].__data__.result();
      for (let x = 1; x < nodes.length + 1; x++) {
        if (x % 2 === 1) {
          const tempi = (x + 1) / 2;
          const tempx = head[0].x() + r * Math.cos(2 * 3.141592653 * tempi / 27);
          const tempy = head[0].y() + r * Math.sin(2 * 3.141592653 * tempi / 27);
          nodes[x - 1].x(tempx).y(tempy);
        } else {
          const tempi = x / 2;
          const tempx = head[0].x() + r * Math.cos(2 * 3.141592653 * tempi / 27);
          const tempy = head[0].y() - r * Math.sin(2 * 3.141592653 * tempi / 27);
          nodes[x - 1].x(tempx).y(tempy);
        }
        const predicate = findRelationById(head[0].id() + '_' + temp.__data__.id()).predicate();
        addRelationship(head[0], nodes[x - 1], predicate);
      }
      d3.select(this)[0][0].__data__.show = true;
      drawNodes(d3.select(this)[0][0].__data__.result());
      console.log(dataset.nodes);
    } else {// 如果结果展开
      console.log('doubleclick');
      const nodes = d3.select(this)[0][0].__data__.result();
      for (const x of nodes) {
        deletedNodeView(x);
        deletedShipView(x);
      }
      d3.select(this)[0][0].__data__.show = false;
    }
  }
  function saveModal() {
    tempvalue.__data__.caption(captionField.node().value);
    if (tempvalue.__data__.caption() !== '') {
      tempvalue.__data__.variable = false;
      tempvalue.childNodes[1].setAttribute('stroke-dasharray', 'none');
    } else {
      tempvalue.__data__.variable = true;
      tempvalue.childNodes[1].setAttribute('stroke-dasharray', '15');
    }
    console.log(tempvalue.__data__.caption());
    tempvalue.childNodes[3].innerHTML = captionField.node().value;
    const person_name = captionField.node().value;
    const sparql = dbr + dbo + dbp + 'SELECT ?path WHERE {dbr:' + person_name + ' dbo:thumbnail ?path.}';
    d3sparql.query(endpoint, sparql, render);
    function render(json, bug) {
      if ( json != null && json.results.bindings.length !== 0 ) {// 请求成功
        const uri = json.results.bindings[0].path.value;
        tempvalue.childNodes[0].setAttribute('href', uri);
        console.log(uri);
      } else { // 请求失败
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

function editRelationship() {
  const tempvalue = d3.select(this)[0][0];
  const editor = d3.select('.pop-up-editor.relationship');
  appendModalBackdrop();
  editor.classed( 'hide', false );
  const captionField = editor.select('#relationship_type');
  captionField[0][0].parentElement.childNodes[0].focus();
  captionField.node().value = tempvalue.parentElement.childNodes[1].innerHTML || '';

  function saveModal() {
    const predicate = captionField.node().value;
    tempvalue.__data__.predicate(predicate);
    if (tempvalue.__data__.predicate() !== '') {
      tempvalue.__data__.variable = false;
      tempvalue.parentElement.childNodes[0].setAttribute('stroke-dasharray', 'none');
    } else {
      tempvalue.__data__.variable = true;
      tempvalue.parentElement.childNodes[0].setAttribute('stroke-dasharray', '10');
    }
    let subject = '';
    if (tempvalue.__data__.start.result() !== null) {
       subject = 'VALUES ?x {';
      for (const x of tempvalue.__data__.start.result()) {
        subject += 'dbr:' + x.caption() + ' ';
      }
      subject += '} ?x';
    } else {
       subject = 'dbr:' + tempvalue.__data__.start.caption();
    }
    tempvalue.parentElement.childNodes[1].innerHTML = captionField.node().value;
    const sparqltext = 'SELECT ?peoples ?path WHERE {' + subject + ' dbo:' + predicate + ' ?peoples. OPTIONAL {?peoples dbo:thumbnail ?path.}}';
    console.log(sparqltext);
    const sparql = dbr + dbo + dbp + sparqltext;
    d3sparql.query(endpoint, sparql, render);
    function render(json) {
      console.log(json);
      if ( json !== undefined && json.results.bindings.length !== 0) {// 请求成功
        console.log(json);
        const nodes = [];
        const node = tempvalue.__data__.end;
        const length = json.results.bindings.length;
        if (length === 1) {
          if (json.results.bindings[0].peoples.value.substr(0, 28) === 'http://dbpedia.org/resource/') {
            tempvalue.__data__.end.caption(json.results.bindings[0].peoples.value.slice(28));
            const text = d3.selectAll('#id' + tempvalue.__data__.end.id())[0][0];
            text.parentElement.childNodes[3].innerHTML = json.results.bindings[0].peoples.value.slice(28);
          } else {
            tempvalue.__data__.end.caption(json.results.bindings[0].peoples.value);
            const text = d3.selectAll('#id' + tempvalue.__data__.end.id())[0][0];
            text.parentElement.childNodes[3].innerHTML = json.results.bindings[0].peoples.value;
          }

        } else {
          tempvalue.__data__.end.caption('List ' + length);
          const text = d3.selectAll('#id' + tempvalue.__data__.end.id())[0][0];
          text.parentElement.childNodes[3].innerHTML = 'List ' + length;
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
    if ( x.start.id() === node.id()) {
      tailNodes.push(x.end);
    }
  }
  return tailNodes;
}

function rotateIfRightToLeft(r) {
  return r.end.isLeftOf( r.start ) ? ' ' : null;
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

function touchRing(d) {
  console.log('333');
  const t = d3.select(this);
  const node = createNode(parseInt(t[0][0].getAttribute('cx'), 10), parseInt(t[0][0].getAttribute('cy'), 10));
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
  const svg = d3.selectAll('svg');
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

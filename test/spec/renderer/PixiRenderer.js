describe('PixiRenderer', () => {
  const timestamp = 1649012524130;
  let map;
  let renderData;
  let graphEntities;
  let projection;
  let zoom;
  let content;

  // Converts a list of json OSM entities to osm objects
  function jsonToOSM(renderData) {
    // Entity data is already split into points, vertices, lines, and polygons.
    let osmRenderData = {};

    let points = renderData.points.map(point => iD.osmNode(point));
    let vertices = renderData.vertices.map(vertex => iD.osmNode(vertex));
    let lines = renderData.lines.map(line => iD.osmWay(line));
    let polygons = renderData.polygons.map(polygon => iD.osmWay(polygon));

    osmRenderData.points = points;
    osmRenderData.vertices = vertices;
    osmRenderData.lines = lines;
    osmRenderData.polygons = polygons;

    return osmRenderData;
  }


  // Converts a list of json OSM entities to osm objects
  function castEntities(entities) {
    let osmEntities = [];
    for (entityKey in entities) {
      let entity = entities[entityKey];
      if (entity.id.charAt(0) === 'w') osmEntities.push(new iD.osmWay(entity));
      if (entity.id.charAt(0) === 'n') osmEntities.push(new iD.osmNode(entity));
    }

    return osmEntities;
  }


  before(done => {
    // See the commented section near the top of the Pixi OSM Layer renderer
    // for details of how to obtain one of these canned data files.
    const staticData = window.__fixtures__['test/spec/renderer/canned_osm_data'];

    //Re-marshal the parsed json data back into osm / projection objects.
    renderData = jsonToOSM(staticData.data);
    graphEntities = castEntities(staticData.entities);
    projection = new iD.sdk.Projection(staticData.projection._x, staticData.projection._y, staticData.projection._k);
    zoom = staticData.zoom;
    done();
  });


  beforeEach(() => {
    content = d3.select('body').append('div');
    context = iD.coreContext().assetPath('../dist/').init().container(content);

    const graph = context.graph();
    graph.rebase(graphEntities, [graph], false);
    map = context.map();
    content.call(map);
  });


  afterEach(() => content.remove());


  describe('#osmRenderer', () => {
    it('renders the canned data scene', () => {
      const osmLayer = context.scene().getLayer('osm');
      osmLayer.drawPoints(timestamp, projection, zoom, renderData.points);
      osmLayer.drawVertices(timestamp, projection, zoom, renderData.vertices);
      osmLayer.drawLines(timestamp, projection, zoom, renderData.lines);
      osmLayer.drawPolygons(timestamp, projection, zoom, renderData.polygons);
    });
  });

});

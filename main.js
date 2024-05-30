window.onload=init
function init(){
    const map= new ol.Map({
        view: new ol.View({
            // center:[0,0],
            center: ol.proj.fromLonLat([79.53, 17.98]),
            zoom:4,
            // maxZoom: 10,
            // minZoom: 2,
            // rotation: 0.5
        }),

        target: "js-map"

    })
    //Adding the base layer
    
    const OSMStandard = new ol.layer.Tile({
        source: new ol.source.OSM(),
    // zIndex:0,
    visible:true,
    title: 'OSMStandard'
    // extent:[7452161.885163681,501531.71304235095,11116848.094956594,4469949.507237884]
    })

    const OSMHumantarian = new ol.layer.Tile({
                source: new ol.source.OSM({
                    url:'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
                }),
                // zIndex:1,
                visible:false,
                title: 'OSMSHumanitarian'
                // extent:[7452161.885163681,501531.71304235095,11116848.094956594,4469949.507237884]
            })

    const BingMaps = new ol.layer.Tile({        
                source: new ol.source.BingMaps({
                    key: 'AvfYAHlHKxISbw4Dp3c0PDshVawerUobwy8KBsLQ01kXny-8OjlBje60O542RkIv',
                    // imagerySet: 'Aerial'
                    imagerySet: 'AerialWithLabels'

                }),
                // zIndex: 2,
                visible: false,
                title:'BingMap'
    })

    const stamenBaseLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            // url: 'https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png'
            // url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg'
            url:'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg'
        }),
        visible: false,
        
    })

    const stamenBaseMapLayer = new ol.layer.Tile({
        source: new ol.source.Stamen({
            layer:'terrain'
        }),
        // zIndex: 3,
        visible: false,
        title: 'StamenTerrain'
    })

    const cartoDBBaselayer = new ol.layer.Tile({
        source:new ol.source.XYZ({
            url:'https://b.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{scale}.png',
        }),
        // zIndex: 4,
        visible: false,
        title: 'CartoDB'
    })


    const baseLayerGroup = new ol.layer.Group({
        layers: [OSMStandard, OSMHumantarian, BingMaps, stamenBaseMapLayer, cartoDBBaselayer]
    })
    map.addLayer(baseLayerGroup);


// Layer Switcher Logic for Base Layers

    const baseLayerElements = document.querySelectorAll('.sidebar>input[type=radio]')

    for(let baseLayerElement of baseLayerElements){
        baseLayerElement.addEventListener('change', function(){
            let baseLayerElementValue=this.value;
            baseLayerGroup.getLayers().forEach(function(element, index, array){
                let baseLayerName=element.get('title');
                element.setVisible(baseLayerName===baseLayerElementValue);
                element.get('visible')
            })
        })
    }


    const NOAAWMSLayer = new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url:"https://new.nowcoast.noaa.gov/arcgis/services/nowcoast/forecast_meteoceanhydro_sfc_ndfd_dailymaxairtemp_offsets/MapServer/WMSServer?",
            params:{
                LAYERS: 1,
                FORMAT: 'image/png',
                TRANSPARENT: true
            }

        }),
        visible: false,
        title: 'NOAAWMSLayer'
    })
    //map.addLayer(NOAAWMSLayer);

    const vectorGJLayer = new ol.layer.Vector({
        source : new ol.source.Vector({
            url:'./NITs.geojson',
            format: new ol.format.GeoJSON()
        }),
        visible: false,
        title: 'vectorGJLayer'
    })
    //map.addLayer(vectorGJLayer);

    const vectorKMLLayer = new ol.layer.Vector({
        source : new ol.source.Vector({
            url:"./area.kml",
            format: new ol.format.KML()

        }),
        visible: false,
        title: 'vectorKMLLayer'
    })
    //map.addLayer(vectorKMLLayer);

    const rasterLayer = new ol.layer.Image({
        source : new ol.source.ImageStatic({
            url:'./rasterdata.png',
            imageExtent: [7693727.35, 1609368.66, 9415480.12, 3116746.69]
        }),
        title: 'rasterLayer',
        visible: false
    })
    //map.addLayer(rasterLayer);
    
    const otherLayerGroup = new ol.layer.Group({
          layers: [NOAAWMSLayer,vectorGJLayer,vectorKMLLayer,rasterLayer]
    })
    map.addLayer(otherLayerGroup);
    
    const otherLayerElements = document.querySelectorAll('.sidebar>input[type=checkbox]')
    for(let otherLayerElement of otherLayerElements){
        otherLayerElement.addEventListener('change', function(){
            let otherLayerElementValue = this.value
            let otherLayer;
            otherLayerGroup.getLayers().forEach(function(element,index,array){
                if(otherLayerElementValue===element.get('title')){
                    otherLayer=element;
                }
            })
            this.checked?otherLayer.setVisible(true):otherLayer.setVisible(false)
        })
    }

    //Geolocation API
    const viewProjection = map.getView().getProjection();
    const geolocation = new ol.Geolocation({
        tracking:true,
        trackingOption:{
            enableHighAccuracy:true
        },
        projection:viewProjection
    })

    const geolocationElement = document.getElementById('geolocation');
    geolocation.on('change:position',function(e){
        let geolocation = this.getPosition();
        let longLatGeolocation = ol.proj.toLonLat(geolocation,viewProjection);
        map.getView().setCenter(geolocation);
        geolocationElement.innerHTML='Longitude:'+longLatGeolocation[0].toFixed(2)+'Latitude:'+longLatGeolocation[1].toFixed(2);
    })





     // vector layer popup information
     const overlayContainerElement = document.querySelector('.overlay-container')
     const overlayLayer = new ol.Overlay({
        element:overlayContainerElement
     })
     map.addOverlay(overlayLayer);
     const overlayFeatureName = document.getElementById('feature-name');
     const overlayFeatureInfo1 = document.getElementById('feature-info1');
     const overlayFeatureInfo2 = document.getElementById('feature-info2');
     const overlayFeatureInfo3 = document.getElementById('feature-info3');
     const overlayFeatureInfo4 = document.getElementById('feature-info4');

     

    // Vector layer Information
    map.on('click', function(e){
        overlayLayer.setPosition(undefined);
        map.forEachFeatureAtPixel(e.pixel,function(feature,layer){
            let clickedCoordinate = e.coordinate;
            let clickedFeatureName = feature.get('Institute Name');
            let clickedFeatureInfo1 = feature.get('Courses');
            let clickedFeatureInfo2 = feature.get('Total Courses');
            let clickedFeatureInfo3 = feature.get('Entrance Exams');
            let clickedFeatureInfo4 = feature.get('Link');
            if(clickedFeatureName && clickedFeatureInfo1 && clickedFeatureInfo2 && clickedFeatureInfo3 && clickedFeatureInfo4 != undefined){
                overlayLayer.setPosition(clickedCoordinate);
                overlayFeatureName.innerHTML = clickedFeatureName;
                overlayFeatureInfo1.innerHTML=clickedFeatureInfo1;
                overlayFeatureInfo2.innerHTML=clickedFeatureInfo2;
                overlayFeatureInfo3.innerHTML=clickedFeatureInfo3;
                overlayFeatureInfo4.innerHTML=clickedFeatureInfo4;
            }
        })
     // console.log(e.coordinate);

    
    })

    
}


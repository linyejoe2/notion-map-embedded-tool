let view, map;

require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/layers/FeatureLayer",
  "esri/widgets/BasemapToggle",
  "esri/widgets/Popup",
  "esri/widgets/Home",
  "esri/widgets/Locate",
  "esri/widgets/LayerList",
  "esri/widgets/Search"
], function (Map, MapView, Graphic, GraphicsLayer, FeatureLayer, BasemapToggle, Popup, Home, Locate, LayerList, Search) {

  // 建立地圖
  map = new Map({
    basemap: "gray-vector"
    // basemap: "dark-gray-vector", // 全黑，風格不錯
    // basemap: "oceans", // 土地是白的，方便看清楚其他資訊
  });

  // 建立地圖視圖
  view = new MapView({
    container: "viewDiv",
    map: map,
    center: [139.7452043, 35.6870601],
    zoom: 7,
    popup: {
      dockEnabled: true,
      collapseEnabled: false,
      maxInlineActions: null,
      dockOptions: {
        buttonEnabled: false,
        breakpoint: false,
        // breakpoint: {
        //   width: 600,
        //   height: 400
        // }
      }
    }
  });

  // 建立底圖切換器
  view.ui.add(new BasemapToggle({
    view: view,
    nextBasemap: "osm", // 切換後的底圖
    container: document.createElement("div")
  }), "bottom-left");

  // 建立回初始畫面工具
  view.ui.add(new Home({
    view: view,
    // 讓回初始畫面的動畫更司滑
    goToOverride: function (view, goToParams) {
      goToParams.options.duration = 1000;
      return view.goTo(goToParams.target, goToParams.options);
    }
  }), "top-left");

  // 建立 featureLayer 來顯示籃球場點位
  const featureLayer = new FeatureLayer({
    id: "bBallLayer",
    fields: [{ name: "ObjectID", alias: "ObjectID", type: "oid" },
    { name: "name", alias: "名稱", type: "string" },
    { name: "address", alias: "地址", type: "string" },
    { name: "team", alias: "主場隊伍", type: "string" },
    { name: "league", alias: "所屬聯盟", type: "string" },
    { name: "rentState", alias: "是否對外開放", type: "string" },
    { name: "rentMemo", alias: "租借規則", type: "string" },
    { name: "rentUrl", alias: "場館官網", type: "string" },
    { name: "tel", alias: "聯絡該場館", type: "string" },
    { name: "photo1", alias: "圖片", type: "string" }],
    objectIdField: "ObjectID",
    geometryType: "point",
    spatialReference: {
      wkid: 4326
    },
    source: [], // 空的圖層
    renderer: {
      type: "unique-value",
      field: "league",
      orderByClassesEnabled: true,
      defaultSymbol: {
        // type: "picture-marker",
        // url: "img/basketball.png",
        // width: "15px",
        // height: "15px"
        type: "simple-marker",
        style: "circle",
        color: "#32B3EB",
        outline: {
          color: "#65D0FE",
          width: "1px"
        },
        size: "16px"
      },
      uniqueValueInfos: [
        {
          value: "T1 聯盟",
          symbol: {
            type: "picture-marker",
            url: "img/team/t1league.svg",
            width: "50px",
            height: "50px"
          }
        },
        {
          value: "P. LEAGUE+",
          symbol: {
            type: "picture-marker",
            url: "img/team/pleague.png",
            width: "50px",
            height: "50px"
          }
        },
      ]
    },
    // featureReduction: {
    //   type: "cluster"
    // },
    popupTemplate: {
      title: "{name}",
      collapseEnablejd: false,
      content: [
        {
          type: "media",
          mediaInfos: [
            {
              type: "image",
              value: {
                sourceURL: "{photo1}",
                linkURL: "{photo1}",
              },
            },
          ],
        },
        {
          type: "fields",
          fieldInfos: [
            { fieldName: "address", label: "地址", visible: "{address}" !== "" },
            { fieldName: "team", label: "主場隊伍", visible: "{team}" !== "" },
            { fieldName: "league", label: "所屬聯盟", visible: "{league}" !== "" },
            { fieldName: "rentState", label: "是否對外開放", visible: "{rentState}" !== "" },
            // { fieldName: "rentMemo", label: "租借規則", },
            { fieldName: "rentUrl", label: "場館網站", visible: "{rentUrl}" !== "" },
            { fieldName: "tel", label: "聯絡該場館", visible: "{tel}" !== "" },
          ],
        },
        // {
        //   type: "text",
        //   text: "<h2>租借規則</h2><br>" + "{rentMemo}"
        // },
      ],
    },
  });
  map.add(featureLayer);

  // 呼叫 api 取得籃球場資料，並將資料轉成 Graphics 顯示在地圖上
  fetch("https://script.google.com/macros/s/AKfycbz8dfD4bGT6NYSls3LOfsr6Gz3b3Fm3iJUyI8o_Z-axrSsQtyFhXASHoz3GZU0XkklgPw/exec")
    .then(response => response.json())
    .then(data => {
      let graphArr = [];
      data.locations.forEach(function (feature) {
        var graphic = new Graphic({
          geometry: {
            type: "point",
            longitude: feature.lon,
            latitude: feature.lat
          },
          attributes: {
            "name": feature.name,
            "address": feature.address,
            "team": feature.team,
            "league": feature.league,
            "rentState": feature.rent_state,
            "tel": feature.tel,
            "photo1": feature.photo1,
            "rentMemo": feature.rent_memo,
            "rentUrl": feature.rent_url
          },

        });
        graphArr.push(graphic);
      });

      featureLayer.applyEdits({
        addFeatures: graphArr
      });
    });

  // // 創建一個 Search widget
  const searchWidget = new Search({
    view: view,
    allPlaceholder: "搜尋籃球場名稱",
    includeDefaultSources: false,
    sources: [{
      layer: featureLayer,
      placeholder: "搜尋籃球場名稱",
      maxResults: 5,
      searchFields: ["name"],
      displayField: "name",
      name: "搜尋籃球場名稱",
      // filter: searchExtent
    }],
    locationEnabled: false
  });
  view.ui.add(searchWidget, {
    position: "top-right",
    index: 2
  });

  searchWidget.on("select-result", (event) => {
    console.log(event)
    view.goTo({
      target: event.result.feature,
      zoom: 15
    }, { duration: 2000 });
  })

  // 監聽點擊事件，彈出 Popup 顯示籃球場資訊
  view.on("click", function (event) {
    view.hitTest(event).then(function (response) {
      var graphic = response.results[0].graphic;
      if (graphic.layer === featureLayer) {
        view.goTo({
          target: graphic,
          zoom: 15
        }, { duration: 2000 });
      }
    });
  });

  // 定位使用者位置
  view.ui.add(new Locate({
    view: view,   // Attaches the Locate button to the view
    graphic: new Graphic({
      // symbol: { type: "simple-marker" }  
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [36, 153, 222, 0.7],
        size: "30px",
        outline: {
          color: "#BAD8E4",
          width: "20px"
        }
      }
      // graphic placed at the location of the user when found
    }),
    goToOverride: function (view, goToParams) {
      goToParams.options.duration = 2000;
      return view.goTo(goToParams.target, goToParams.options);
    }
  }), { position: "top-left", index: 1 });

});

export { view, map };
// The module loader for AuShadha scripts
define(['dojo/dom',
        'dojo/dom-construct',
        'dojo/dom-style',
        'dojo/dom-class',
        'dojo/on',
        'dojo/json',
        'dojo/_base/array',
        'dijit/registry',
        'dijit/layout/BorderContainer',
        'dojox/layout/ContentPane',
        'dijit/layout/TabContainer',
        'dijit/form/FilteringSelect',

        "dojo/parser",

        "dojox/grid/DataGrid",
        "dojo/store/JsonRest",
        "dojo/data/ObjectStore",
        "dojo/request",
        "dojo/json",

       "aushadha/main",
       "aushadha/grid/generic_grid_setup",
       "aushadha/grid/grid_structures",
       'aushadha/tree/pane_tree_creator',
       'aushadha/panes/create_main_pane',
       'aushadha/panes/create_sub_module_pane',

       "dojo/ready",
       'dojo/domReady!'
    ],
    function (
        dom,
        domConstruct,
        domStyle,
        domClass,
        on,
        JSON,
        array,
        registry,
        BorderContainer,
        ContentPane,
        TabContainer,
        FilteringSelect,

        parser,
        DataGrid,
        JsonRest,
        ObjectStore,
        request,
        JSON,

        auMain,
        auGenericGridSetup,
        GRID_STRUCTURES,
        buildTree,
        createMainModulePane,
        createSubModulePane,
        ready){

      var pane = {

        panes: [],

        constructor: function( appObj ) {

              console.log( "calling the dynamic_pane_creator constructor method with arguments: " );
              console.log( appObj.app );

              var appObj = appObj.app;

              var centerMainPane = registry.byId( 'centerMainPane' );
              var centerTopTabPane= registry.byId( "centerTopTabPane" );

              if ( !centerTopTabPane ) {

                if (! dom.byId( 'centerTopTabPane' ) ) {

                  domConstruct.create('div',
                                      { id:'centerTopTabPane' },
                                      'centerMainPane',
                                      0
                                     );

                }

                centerTopTabPane = new TabContainer({ tabPosition:'top',
                                                      tabStrip:true
                                                    },
                                                    'centerTopTabPane'
                                                   );

                centerMainPane.addChild( centerTopTabPane );
                centerTopTabPane.startup();

              }

              console.log("Starting to iterate on the Panes by calling appPaneCreator method");

              for ( var x=0; x < appObj.length; x++ ) {
                console.log("Creating " + appObj[x].app + " Pane");
                appPaneCreator( appObj[x] );
                console.log("Created " + appObj[x].app + " Pane");
              }

              var numChildren = centerTopTabPane.getChildren().length;
              var lastChild = centerTopTabPane.getChildren()[numChildren-1];
              console.log("Last Child of Tabbed Pane is : ");
              console.log(lastChild);
              centerTopTabPane.selectChild(lastChild);

        },

        destroyPane: function(){
          for( var x = 0; x < pane.panes.length; x++ ) {
            registry.byId( pane.panes[x].domNode ).destroyRecursive();
          }
        }

      }

      function appPaneCreator( appObj ) {

        console.log("Calling appPaneCreator method with arguments: ");
        console.log(appObj);

        var title = appObj.app;
        var url = appObj.url;
        var domId = appObj.app.replace(' ','_');
        domId = domId.toLowerCase();


        var uiSections = appObj.ui_sections;            


        var layoutSections = uiSections.layout;
        var appType = uiSections.app_type;


        var loadFirst = uiSections.load_first;
        var loadAfter = uiSections.load_after;


        var gridEnabled = uiSections.widgets.grid;
        var searchEnabled = uiSections.widgets.search;
        var treeEnabled = uiSections.widgets.tree;
        var summaryEnabled = uiSections.widgets.summary;

        var d = dom.byId(domId);
        var p = registry.byId(domId);

        console.log("Creating pane with domId: " + domId);
        console.log( registry.byId(domId+"_main") );
        window.PANES[ title.toUpperCase() ] = { LOAD_STATUS : false }

        function runMainModulePaneCreator(){

          if ( window.PANES[loadAfter.toUpperCase()].LOAD_STATUS ){

              if ( ! registry.byId(domId+"_main") ){

                    var mainTabPaneDomNode = createMainModulePane( d, p, title, domId,true );

                    registry.byId(domId+"_top").set('content',dom.byId(loadAfter+"_top").innerHTML );
                    domClass.add(dom.byId(domId+"_top"),'selected');

                    if ( treeEnabled ) {
                      var domN = domId+"_leading_tree";
                      new buildTree( treeEnabled , domN, mainTabPaneDomNode );
                    }

                    if ( summaryEnabled ) {
                      var summaryDomN = domId+"_center_summary_tab";
                      registry.byId( summaryDomN ).set( 'href',summaryEnabled );
                    }

                    if ( gridEnabled ){
                      console.log( "Grid Store URL is : " + gridEnabled );
                      var gridTitle = title.replace(' ','_'); 
                      gridTitle = gridTitle.toUpperCase().toString();
                      var gridStore = gridTitle + "_GRID_STORE";
                      var gridDom   = gridTitle.toLowerCase() + "_grid_container";
                      console.log( "Trying to Grid for App : , " + gridTitle + 
                                   " with Store as: " + gridStore + 
                                   " and DOM as " + gridDom
                                 );

                      if (! dom.byId('search_grid_tc') ){
                        domConstruct.create('div',
                                            { id    : 'search_grid_tc' },
                                            'search_cp_grid',
                                            0
                                          );
                      }

                      if (! registry.byId('search_grid_tc') ) {

                        var search_tc = new TabContainer({ id:'search_grid_tc',
                                                           tabPosition:'top',
                                                           tabStrip:true
                                                        });

                        registry.byId( 'search_cp_grid' ).addChild( search_tc );

                      }

                      else{
                        var search_tc  = registry.byId( 'search_grid_tc' );
                      }

                      if (! dom.byId(gridDom) ) {

                        domConstruct.create('div',
                                            { id    : gridDom+"_grid_cp"},
                                            'search_grid_tc',
                                            'last'
                                          );

                        domConstruct.create('div',
                                            { id    : gridDom,
                                              class : 'gridContainer'
                                            },
                                            gridDom+"_grid_cp",
                                            'last'
                                          );

                      }

                      if ( ! registry.byId( gridDom+"_grid_cp") ) {

                        cp = new ContentPane({ id: gridDom+"_grid_cp",
                                               title: title },
                                              gridDom+"_grid_cp"
                                            );

                        search_tc.addChild( cp );
                        search_tc.startup();

                      }
                      
                      if (! registry.byId(gridDom) ) {
                          auGenericGridSetup.setupGrid(
                                                    gridEnabled,                   // URL of the GRID
                                                    gridDom,                       // DOM id to put the Grid into
                                                    GRID_STRUCTURES[gridTitle],    // Grid Structure
                                                    true,                          // Whether to activate RowSingleClick behavior
                                                    gridTitle,                     // Title of the Grid
                                                    gridStore                      // Variable name for Grid Store
                                                    );   
                      }
                      else{
                        console.log("Grid already made.. re-rendering");
                        registry.byId(gridDom).render();
                      }

                    }

                    if ( searchEnabled && title =='Patient' ) {

                      console.log("Enabling Search for Header Pane Search widget with URL of : " + searchEnabled );
                      auMain.auEventBinders.headerPaneSearchWidget( searchEnabled,'Search for:  '+ title);
                      auMain.auEventBinders.searchWidget( searchEnabled,'Search for:  '+ title);                    

                    }                        

                    window.PANES[ title.toUpperCase() ].LOAD_STATUS = true;

                  }

                }

                else{
                  console.log("Module Pane cannot be created now as a dependent pane has not yet finished loading...");
                  window.DEFERRED_LOAD_PANES.push( obj[x] );
                }

              }

              if ( appType == 'main_module' && loadFirst == true ){
                runMainModulePaneCreator();
              }

              else if( appType == 'main_module' && loadFirst == false ){
                runMainModulePaneCreator();
              }

              else if( appType == 'sub_module' ){
                createSubModulePane( d,p,title,domId );
              }

    }

    return pane.constructor ;

});
define([
    'dojo/window',
    "dojo/store/Memory",
    "dijit/tree/ObjectStoreModel",
    "dijit/Tree",
    "dijit/tree/ForestStoreModel",
    "dojo/data/ItemFileReadStore",

    "dojo/dom",
    "dijit/registry",
    "dojo/dom-construct",
    "dojo/dom-style",
    'dojo/dom-attr',
    "dojo/json",

    'dojox/fx/scroll',

    'dojo/query',
    'dojo/request',

    "dijit/registry",
    "dojox/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/layout/TabContainer",

    'aushadha/grid/grid_structures',
    'aushadha/panes/create_tab',
    'aushadha/panes/create_form_tab',
    'aushadha/panes/create_empty_tab',
    'aushadha/panes/create_form_container',
    'aushadha/panes/create_grid_container'    

  ], 
  function(win,
          Memory, 
          ObjectStoreModel,
          Tree,
          ForestStoreModel,
          ItemFileReadStore,
          dom, 
          registry,
          domConstruct, 
          domStyle, 
          domAttr,
          JSON,
          scroll,
          query,
          request,

          registry,
          ContentPane,
          BorderContainer,
          TabContainer,

          GRID_STRUCTURES,
          createTab,
          createFormTab,
          createEmptyTab,
          createFormContainer,
          createGridContainer){

    function buildPatientTree(url,domNode, mainTabPaneDomNode){

        var treeStore = new ItemFileReadStore({url: url,
                                              clearOnClose:true,
                                              heirarchial:false
        });

        // Create the model
        var treeModel = new ForestStoreModel({store         : treeStore,
                                              query         : {type: 'application'},
                                              rootId        : 'root',
                                              rootLabel     : "Patient",
                                              childrenAttrs : ["children"]
                                              });

//         console.log(createTab);
        var mainTabPaneDomNodeId = mainTabPaneDomNode ? domAttr.get(mainTabPaneDomNode,'id'):'patient_center_tc' ;

        var makeUpModuleName = function(module_string , parentName/* module | String */){
           console.log("revieved " + module_string + " to makeUpModuleName");
          var _split_string = module_string.toString().split('_');
          var module_name = [];
          if (! parentName){
            var y ={parent: mainTabPaneDomNodeId,module_name:''}; 
          }else{
            var y ={parent:parentName.toString(),module_name:''}; 
          }

          for(var i=0; i< (_split_string.length-1); i++){ 
              module_name.push( _split_string[i] ); 
               console.log(module_name);
          }; 

          y.module_name = module_name.join('_');
           console.log(y);
          return y;
        }

        function makeTabConstructorArgument(module,item){
            var tabArgs = { 
              parent: module.parent,
              module_type:item.type,
              module_label:module.module_name,

              widgets_allowed: ['grid','button'],

              dom:{id: module.parent + '_' + module.module_name +'_cp',
                    parent: module.parent ,
                    title : "Add " + item.name
              },

              grid:{id: module.module_name + '_list',
                    url:CHOSEN_PATIENT.urls.json[module.module_name],
                    str: GRID_STRUCTURES[module.module_name.toUpperCase()]
              },

              button:{label: 'Add', 
                      title: "Add "+ item.name,
                      url : CHOSEN_PATIENT.urls.add[module.module_name]
              }
            }
            console.log(tabArgs);
            return tabArgs;
        }

        function makeTheTab(item,parentName, makeContainer){
            var item = item;

            if(item.type != 'application'){
              var module = makeUpModuleName(item.type, parentName);
            }

            else{
              var module = makeUpModuleName(item.module_type, parentName);
            } 

            var tabArgs = makeTabConstructorArgument(module, item);

            if(! makeContainer){

              var tab_parent = registry.byId(tabArgs.dom.parent)
              var tab_dijit = registry.byId(tabArgs.dom.id);

              if(! tab_dijit){
                  createTab.constructor(tabArgs);
              }
              else{
                  tab_parent.selectChild(tab_dijit);
              }

            }

            else{
                return createGridContainer.constructor(tabArgs);
            }
        }

        var tree = new Tree({model   : treeModel,
                             showRoot: false,
                             onDblClick: function(item,node,evt){

                                              var formLayout = (['form']).sort().toString();
                                              var gridLayout = (['grid','button']).sort().toString();

                                              if(item.ui_layout == 'standard'){

                                                var widgets = item.widgets.sort().toString() ;

                                                if (widgets == gridLayout ){
                                                  makeTheTab(item);
                                                }else if(widgets == formLayout ){
                                                  var obj={parent: mainTabPaneDomNodeId ,
                                                           module_name: (item.module_name).toString(),
                                                           module_title: (item.name).toString(),
                                                           url:CHOSEN_PATIENT.urls.add[ item.module_name.toString() ]
                                                  };
                                                  createFormTab.constructor(obj);

                                                }else{
                                                  alert("This is an unimplemented widget arrangement !! ");
                                                  return false;
                                                }

                                              }
                                              else if (item.ui_layout == 'composite'){

                                                  var p_widget_layout = item.widgets.sort().toString();

                                                  var obj={parent: mainTabPaneDomNodeId,
                                                           module_name: item.module_name.toString(),
                                                           module_title: item.name.toString(),
                                                  };

                                                  var emptyTab = createEmptyTab.constructor(obj);

                                                  console.log("Creating vertical layout");
                                                  emptyTab.addBc('vertical');

                                                  if (p_widget_layout == formLayout ) {
                                                    var formArgs={ parentPane: emptyTab.pane,
                                                                   module_name: item.module_name.toString(),
                                                                   module_title: item.name.toString(),
                                                                   url:CHOSEN_PATIENT.urls.add[ item.module_name.toString() ]
                                                    };
                                                    emptyTab.pane.Bc.topCp.addChild( createFormContainer.constructor(formArgs) );
                                                  }

                                                  else if(p_widget_layout == gridLayout ){
                                                    var parentNode = domAttr.get(emptyTab.pane.Bc.topCp.domNode,'id')
                                                    emptyTab.pane.Bc.topCp.addChild( makeTheTab(item,
                                                                                                parentNode,
                                                                                                true)
                                                                                   );
                                                  }

                                                  console.log("Trying to create a SubTabcontainer");
                                                  console.log("Existing Content panes are: ");
                                                  console.log(emptyTab.pane.Bc.topCp);
                                                  console.log(emptyTab.pane.Bc.bottomCp);

                                                  var linkedTc = TabContainer({tabStrip:true,
                                                                               tabPosition:'top',
                                                                               style: "height: 100%; width: 400px; overflow: auto;"
                                                                              },
                                                                              domConstruct.create('div',{id: item.module_name.toString()+"_subTc"},
                                                                                                  emptyTab.pane.Bc.bottomCp.domNode,
                                                                                                  'last')
                                                                             );

                                                  for (var x=0; x< item.linked_modules.length; x++){

                                                      var linked_widget_layout = item.linked_modules[x].widgets.sort().toString();
                                                      console.log(linkedTc);
                                                      var parentName = domAttr.get(linkedTc.domNode, 'id').toString();

                                                      if (linked_widget_layout == gridLayout ){
                                                        var theTab = makeTheTab(item.linked_modules[x],
                                                                                      parentName,
                                                                                      true
                                                                                     ) 
                                                        console.log(theTab);
                                                        linkedTc.addChild(theTab);
                                                      }
                                                      else if (linked_widget_layout ==  formLayout ) {
                                                        var linkedModuleFormArgs = {
                                                          parentPane: linkedTc,
                                                          module_name: linked_modules[x].module_name.toString(),
                                                          module_title: linked_modules[x].name.toString(),
                                                          url: CHOSEN_PATIENT.urls.add[ linked_modules[x].module_name.toString()]
                                                        }
                                                        linkedTc.addChild( createFormContainer.constructor(linkedModuleFormArgs) );
                                                      }

                                                  }
                                                  linkedTc.startup();
                                                  emptyTab.pane.Bc.bottomCp.addChild(linkedTc);

                                                  emptyTab.pane.startup();
                                                  var p = emptyTab.pane.getParent(); 
                                                  p.selectChild(emptyTab.pane);
                                              }

                                }
                            },
                            domNode);

        tree.startup();
//      tree.expandAll();
        tree.collapseAll();
    }

    return buildPatientTree;

});
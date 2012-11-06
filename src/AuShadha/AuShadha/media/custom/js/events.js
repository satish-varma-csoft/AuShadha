    /* 
       Contains the Logic of eventing in Patient Search Form Partly. 
       Some of it is implemented in the HTML declaratively.
       Triggered when the patient search text is entered 
       A separate trigger is present in search/patient.html
       for handling the click event of the Filter button
    */

    function patSearchOnKeyUp(e){
      console.log(e.target);
      var search_field   = patSearchForFilteringSelect.get('value');
      var txt            = filterPatGridTextBox.get('value');
      var search_obj     = { search_field : search_field , search_for : txt };
      if( !filterPatGridTextBox.get('value') || !patSearchForFilteringSelect.get('value') ){
        search_obj.search_for   = "*"
        search_obj.search_field = "id"
      }
      grid.filter(search_obj, true);
    }

    function patFilteringSearchOnKeyUp(e){
      require(["dijit/registry","dojo/dom","dojo/dom-style","dojo/dom-construct"], 
      function(registry, dom, domStyle, domConstruct){
        e.store.get(e.get('value')).then(
          function(item /*returned item*/){
            console.log(item)
            domStyle.set('selected_patient_info',{"display":"","padding":"0px","margin":"0px"});
            var addData = item.addData;
            var selectedPatientContent = addData.full_name + "-" + addData.age +"-" + addData.sex +"(" +addData.patient_hospital_id +")"
            registry.byId('selected_patient_info').set('content', selectedPatientContent);

            var contactUrl        = addData.contactjson;
            var phoneUrl          = addData.phonejson;
            var guardianUrl       = addData.guardianjson;
            var emailUrl          = addData.emailjson;

            var immunisationUrl   = addData.immunisationjson;
            var allergiesUrl        = addData.allergyjson;
            var medicationListUrl = addData.medicationlistjson;

            var familyHistoryUrl  = addData.familyhistoryjson;
            var demographicsUrl   = addData.demographicsadd;
            var socialHistoryUrl  = addData.socialhistoryadd;

            var admissionUrl      = addData.admissionadd;

//            var visitUrl        = addData.visitadd;


/*
             var contactStore           = new JsonRest({target:contactUrl});
             console.log(contactStore);
             var phoneStore             = new JsonRest({target:phoneUrl});
             var guardianStore          = new JsonRest({target:guardianUrl});
             var demographicsStore      = new JsonRest({target:demographicsUrl});
             var socialHistoryStore     = new JsonRest({target:socialHistoryUrl});
             var allergiesStore         = new JsonRest({target:allergiesUrl});
             var familyHistoryStore     = new JsonRest({target:familyHistoryUrl});
             var immunisationStore      = new JsonRest({target:immunisationUrl});
             var medicationListStore    = new JsonRest({target:medicationListUrl});

             var admissionStore    = new JsonRest({target:admissionUrl});
*/
//            {% comment %} 
  //             var visitStore        = new JsonRest({target:visitUrl}); 
//            {% endcomment %}

            console.log("Destroying the Grids and Forms...");

            registry.byId("patientSocialHistoryTab").set('href', socialHistoryUrl);
            registry.byId("demographics_add_or_edit_form").set('href', demographicsUrl);

            console.log("Finished setting up the Forms...");

//            reInitBottomPanels();
            console.log("Setting up the Grids Now...");
            setupContactGrid(contactUrl);
            setupPhoneGrid(phoneUrl);

            setupFamilyHistoryGrid(familyHistoryUrl);
            setupGuardianGrid(guardianUrl);


            setupImmunisationGrid(immunisationUrl);

            setupMedicationListGrid(medicationListUrl);
            setupAllergiesGrid(allergiesUrl);

            setupAdmissionGrid(admissionUrl);
//            setupVisitGrid(visitUrl);

           console.log("Finished setting up the grids....");

         }
        );
      });
//      patSearchForJsonRestStore.query("?search_for="+search_obj.search_field +"&search_field="+search_obj.search_field)
    }

    function patSearchForFilteringSelectOnChange(newVal){
      if(newVal){
        console.log(newVal);
        if(newVal == 'full_name'){
          dojo.byId("searchLinker").innerHTML = "contains..";
          filterPatGridTextBox.focus();
        }
        else if(newVal == 'id'){
          dojo.byId("searchLinker").innerHTML = "equal to";
          filterPatGridTextBox.focus();
        }
        else{
          dojo.byId("searchLinker").innerHTML = "starts with..";
          filterPatGridTextBox.focus();
        }
      }
      else{
        console.log("No Selection Supplied.. Enforcing Full Name selection..")
        patSearchForFilteringSelect.set('displayedValue', 'Full Name');
        dojo.byId("searchLinker").innerHTML = "contains..";
        filterPatGridTextBox.focus();
      }
    }



angular.module("umbraco").controller("UmbracoForms.RenderTypes.FileController",
    function($scope){

       

        var imageExts = ['jpg','jpeg','png','gif','bmp'];

        $scope.files = $scope.field.replace('~', '').split(',');

        $scope.isImage = function(filepath){
            return imageExts.indexOf( $scope.getExtension(filepath) ) >= 0;
        };

        $scope.getExtension = function(filepath){
            return filepath.substring(filepath.lastIndexOf(".")+1).toLowerCase();
        };

        $scope.getFileName = function(filepath){
            return filepath.substring(filepath.lastIndexOf("/")+1);
        };

        $scope.getPreview = function(filepath){
            return filepath.replace('~','') + "?width=400";
        };

    });

angular.module("umbraco").controller("UmbracoForms.SettingTypes.DocumentMapperController",
	function ($scope, $routeParams,pickerResource) {

	    if (!$scope.setting.value) {
	       
	    } else {
	        var value = JSON.parse($scope.setting.value);
	        $scope.doctype = value.doctype;
	        $scope.nameField = value.nameField;
	        $scope.nameStaticValue = value.nameStaticValue;
	        $scope.properties = value.properties;
	    }

	    pickerResource.getAllDocumentTypesWithAlias().then(function (response) {
	        $scope.doctypes = response.data;
	    });

	    pickerResource.getAllFields($routeParams.id).then(function (response) {
	        $scope.fields = response.data;
	    });

	    $scope.setDocType = function() {

	        pickerResource.getAllProperties($scope.doctype).then(function (response) {
	            $scope.properties = response.data;
	        });
	    };

	    $scope.setValue = function() {
	       
	        var val = {};
	        val.doctype = $scope.doctype;
	        val.nameField = $scope.nameField;
	        val.nameStaticValue = $scope.nameStaticValue;
	        val.properties = $scope.properties;

	        $scope.setting.value = JSON.stringify(val);
	    };
	});
angular.module("umbraco").controller("UmbracoForms.SettingTypes.FieldMapperController",
	function ($scope, $routeParams, pickerResource) {

		function init() {

			if (!$scope.setting.value) {
				$scope.mappings = [];
			} else {
				$scope.mappings = JSON.parse($scope.setting.value);
			}

			var formId = $routeParams.id;

			if(formId === -1 && $scope.model && $scope.model.fields) {

			} else {

				pickerResource.getAllFields($routeParams.id).then(function (response) {
					$scope.fields = response.data;
				});
			}
		}

        $scope.addMapping = function() {
			$scope.mappings.push({
                alias: "",
                value: "",
                staticValue: ""
            });
        };

	    $scope.deleteMapping = function(index) {
	        $scope.mappings.splice(index, 1);
	        $scope.setting.value = JSON.stringify($scope.mappings);
	    };

		$scope.stringifyValue = function() {
			$scope.setting.value = JSON.stringify($scope.mappings);
		};

		init();

	});

angular.module("umbraco").controller("UmbracoForms.SettingTypes.File",
	function ($scope, dialogService, utilityService) {

		var umbracoVersion = Umbraco.Sys.ServerVariables.application.version;

	    $scope.openMediaPicker = function() {

			var compareOptions = {
				zeroExtend: true
			};

			var versionCompare = utilityService.compareVersions(umbracoVersion, "7.4", compareOptions);

			if(versionCompare === 0 || versionCompare === 1) {

				$scope.mediaPickerOverlay = {
					view: "mediapicker",
					show: true,
					submit: function(model) {

						var selectedImage = model.selectedImages[0];
						populateFile(selectedImage);

						$scope.mediaPickerOverlay.show = false;
						$scope.mediaPickerOverlay = null;
					}
				};

			} else {

				dialogService.mediaPicker({ callback: populateFile });

			}

	    };

	    function populateFile(item) {

	        //From the picked media item - get the 'umbracoFile' property
	        //Previously we was assuming the first property was umbracoFile but if user adds custom propeties then it may not be the first
            //Rather than a for loop, use underscore.js
	        var umbracoFileProp = _.findWhere(item.properties, {alias: "umbracoFile"});

            $scope.setting.value = umbracoFileProp.value;
        }
	});

angular.module("umbraco").controller("UmbracoForms.SettingTypes.Pickers.ConnectionStringController",
	function ($scope, $routeParams, pickerResource) {
	    pickerResource.getAllConnectionStrings().then(function (response) {
	        $scope.strings = response.data;
	    });
	});
angular.module("umbraco").controller("UmbracoForms.SettingTypes.Pickers.ContentController",
	function ($scope, $routeParams, dialogService, entityResource, iconHelper) {

	if (!$scope.setting) {
	    $scope.setting = {};
	}


	var val = parseInt($scope.setting.value);
	

	if (!isNaN(val) && angular.isNumber(val)) {
	    //node
	    $scope.showQuery = false;

	    entityResource.getById($scope.setting.value, "Document").then(function (item) {
	        item.icon = iconHelper.convertFromLegacyIcon(item.icon);
	        $scope.node = item;
	    });
	} 

	$scope.openContentPicker = function () {
	    var d = dialogService.treePicker({
	        section: "content",
	        treeAlias: "content",
	        multiPicker: false,
	        callback: populate
	    });
	};


	$scope.clear = function () {
	    $scope.id = undefined;
	    $scope.node = undefined;
	    $scope.setting.value = undefined;
	};

	function populate(item) {
	    $scope.clear();
	    item.icon = iconHelper.convertFromLegacyIcon(item.icon);
	    $scope.node = item;
	    $scope.id = item.id;
	    $scope.setting.value = item.id;
	}

});
angular.module("umbraco").controller("UmbracoForms.SettingTypes.Pickers.ContentWithXpathController",
	function ($scope, $routeParams, dialogService, entityResource, iconHelper, utilityService) {

	var umbracoVersion = Umbraco.Sys.ServerVariables.application.version;

	$scope.queryIsVisible = false;
	$scope.helpIsVisible = false;
	$scope.query = "";


	if (!$scope.setting) {
	    $scope.setting = {};
	}

	function init() {

		if(angular.isNumber($scope.setting.value)){

			entityResource.getById($scope.setting.value, "Document").then(function (item) {
				item.icon = iconHelper.convertFromLegacyIcon(item.icon);
				$scope.node = item;
			});

		} else if($scope.setting.value) {

			$scope.queryIsVisible = true;
			$scope.query = $scope.setting.value;

		}

	}

	$scope.openContentPicker = function () {

		var compareOptions = {
			zeroExtend: true
		};

		var versionCompare = utilityService.compareVersions(umbracoVersion, "7.4", compareOptions);

		if(versionCompare === 0 || versionCompare === 1) {

			$scope.treePickerOverlay = {
				view: "treepicker",
				section: "content",
				treeAlias: "content",
				multiPicker: false,
				title: "Where to save",
				subtitle: "Choose location to save this node",
				hideSubmitButton: true,
				show: true,
				submit: function(model) {

					var selectedItem = model.selection[0];
					populate(selectedItem);

					$scope.treePickerOverlay.show = false;
					$scope.treePickerOverlay = null;
				}
			};

		} else {

			var d = dialogService.treePicker({
	        	section: "content",
	        	treeAlias: "content",
	        	multiPicker: false,
	        	callback: populate
	    	});

		}

	};

	$scope.showQuery = function() {
	    $scope.queryIsVisible = true;
	};

	$scope.toggleHelp = function() {
		$scope.helpIsVisible = !$scope.helpIsVisible;
	};

	$scope.setXpath = function() {
	    $scope.setting.value = $scope.query;
	};

	$scope.clear = function () {
	    $scope.id = undefined;
	    $scope.node = undefined;
	    $scope.setting.value = undefined;
		$scope.query = undefined;
		$scope.queryIsVisible = false;
	};

	function populate(item) {
	    $scope.clear();
	    item.icon = iconHelper.convertFromLegacyIcon(item.icon);
	    $scope.node = item;
	    $scope.id = item.id;
	    $scope.setting.value = item.id;
	}

	init();

});

angular.module("umbraco").controller("UmbracoForms.SettingTypes.Pickers.DataTypeController",
	function ($scope, $routeParams, pickerResource) {
	    pickerResource.getAllDataTypes().then(function (response) {
	        $scope.datatypes = response.data;
	    });
	});
angular.module("umbraco").controller("UmbracoForms.SettingTypes.Pickers.DocumentTypeController",
	function ($scope, $routeParams, pickerResource) {
	    pickerResource.getAllDocumentTypesWithAlias().then(function (response) {
	        $scope.doctypes = response.data;
	    });
	});
angular.module("umbraco")
.controller("UmbracoForms.Dashboards.ActivityController",
	function ($scope, recordResource) {

		//var filter = {};
		//recordResource.getRecords(filter).then(function(response){
		//	$scope.records = response.data;
		//});

	});

angular.module("umbraco")
.controller("UmbracoForms.Dashboards.LicensingController",
    function ($scope, $location, $routeParams, $cookieStore, formResource, licensingResource, updatesResource, notificationsService, userService, utilityService) {

        $scope.overlay = {
            show: false,
            title: "Congratulations",
            description: "You've just installed Umbraco Forms - Let's create your first form"
        };

        var packageInstall = $cookieStore.get("umbPackageInstallId");
        if (packageInstall) {
            $scope.overlay.show = true;
            $cookieStore.put("umbPackageInstallId", "");
        }

        //if not initial install, but still do not have forms
        if (!$scope.overlay.show) {
            formResource.getOverView().then(function (response) {
                if (response.data.length === 0) {
                    $scope.overlay.show = true;
                    $scope.overlay.title = "Create a form";
                    $scope.overlay.description = "You do not have any forms setup yet, how about creating one now?";
                }
            });
        }

        $scope.getLicenses = function (config) {

            $scope.loginError = false;
            $scope.hasLicenses = undefined;

            licensingResource.getAvailableLicenses(config).then(function (response) {
                var licenses = response.data;
                var currentDomain = window.location.hostname;

                $scope.hasLicenses = licenses.length > 0;
                _.each(licenses, function (lic) {
                    if (lic.bindings && lic.bindings.indexOf(currentDomain) >= 0) {
                        lic.currentDomainMatch = true;
                    }
                });

                $scope.configuredLicenses = _.filter(licenses, function (license) { return license.configured; });
                $scope.openLicenses = _.filter(licenses, function (license) { return license.configured === false; });

            }, function (err) {
                $scope.loginError = true;
                $scope.hasLicenses = undefined;
            });
        };


        $scope.configure = function (config) {
            licensingResource.configureLicense(config).then(function (response) {
                $scope.configuredLicenses.length = 0;
                $scope.openLicenses.length = 0;
                $scope.loadStatus();

                notificationsService.success("License configured", "Umbraco forms have been configured to be used on this website");
            });
        };

        $scope.loadStatus = function () {
            licensingResource.getLicenseStatus().then(function (response) {
                $scope.status = response.data;
            });


            //Get Current User - To Check if the user Type is Admin
            userService.getCurrentUser().then(function (response) {
                $scope.currentUser = response;
                $scope.isAdminUser = response.userType.toLowerCase() === "admin";
            });

            updatesResource.getUpdateStatus().then(function (response) {
                $scope.version = response.data;
            });

            updatesResource.getVersion().then(function (response) {
                $scope.currentVersion = response.data;
            });


        };

        $scope.upgrade = function () {

            //Let's tripple check the user is of the userType Admin
            if (!$scope.isAdminUser) {
                //The user is not an admin & should have not hit this method but if they hack the UI they could potnetially see the UI perhaps?
                notificationsService.error("Insufficient Permissions", "Only Admin users have the ability to upgrade Umbraco Forms");
                return;
            }

            $scope.installing = true;
            updatesResource.installLatest($scope.version.remoteVersion).then(function (response) {
                window.location.reload();
            }, function (reason) {
                //Most likely the 403 Unauthorised back from server side
                //The error is caught already & shows a notification so need to do it here
                //But stop the loading bar from spinnging forever
                $scope.installing = false;
            });
        };


        $scope.create = function () {
            
            //Get the current umbraco version we are using
            var umbracoVersion = Umbraco.Sys.ServerVariables.application.version;
            
            var compareOptions = {
                zeroExtend: true
            };
            
            //Check what version of Umbraco we have is greater than 7.4 or not 
            //So we can load old or new editor UI
            var versionCompare = utilityService.compareVersions(umbracoVersion, "7.4", compareOptions);
            
            //If value is 0 then versions are an exact match
            //If 1 then we are greater than 7.4.x
            //If it's -1 then we are less than 7.4.x
            if(versionCompare < 0) {
                //I am less than 7.4 - load the legacy editor
                $location.url("forms/form/edit-legacy/-1?template=&create=true");
            }
            else {
                //I am 7.4 or newer - load in shiny new UI
                $location.url("forms/form/edit/-1?template=&create=true");
            }
            
            
        };


        $scope.configuration = { domain: window.location.hostname };
        $scope.loadStatus();
    });

angular.module("umbraco").controller("UmbracoForms.Dashboards.YourFormsController", function ($scope,$location, formResource, recordResource, userService, securityResource, utilityService) {

    var vm = this;

    vm.entriesUrl = 'entries';
		
    //Get the current umbraco version we are using
    var umbracoVersion = Umbraco.Sys.ServerVariables.application.version;
    
    var compareOptions = {
        zeroExtend: true
    };
    
    //Check what version of Umbraco we have is greater than 7.4 or not 
    //So we can load old or new editor UI
    var versionCompare = utilityService.compareVersions(umbracoVersion, "7.4", compareOptions);
    
    //If value is 0 then versions are an exact match
    //If 1 then we are greater than 7.4.x
    //If it's -1 then we are less than 7.4.x
    if(versionCompare < 0) {
        //I am less than 7.4 - load the legacy editor
        vm.entriesUrl = 'entries-legacy';
    }

   vm.formsLimit = 4;

    vm.showAll = function(){
        vm.formsLimit = 50;
    };

    formResource.getOverView().then(function(response){
        vm.forms = response.data;

        _.each(vm.forms, function(form){
            var filter = { form: form.id };

            recordResource.getRecordsCount(filter).then(function(response){
                    form.entries = response.data.count;
            });
        });
    });
});

angular.module("umbraco")
.controller("UmbracoForms.Editors.DataSource.DeleteController",
	function ($scope, dataSourceResource, navigationService, treeService) {
	    $scope.delete = function (id) {
	        dataSourceResource.deleteByGuid(id).then(function () {

	            treeService.removeNode($scope.currentNode);
	            navigationService.hideNavigation();

	        });

	    };
	    $scope.cancelDelete = function () {
	        navigationService.hideNavigation();
	    };
	});
angular.module("umbraco").controller("UmbracoForms.Editors.DataSource.EditController", function ($scope, $routeParams, dataSourceResource, editorState, notificationsService, dialogService, navigationService, userService, securityResource) {
    
    //On load/init of 'editing' a prevalue source then
    //Let's check & get the current user's form security
    var currentUserId = null;

    userService.getCurrentUser().then(function (response) {
        currentUserId = response.id;

        //Now we can make a call to form securityResource
        securityResource.getByUserId(currentUserId).then(function (response) {
            $scope.security = response.data;

            //Check if we have access to current form OR manage forms has been disabled
            if (!$scope.security.userSecurity.manageDataSources) {

                //Show error notification
                notificationsService.error("Access Denied", "You do not have access to edit Datasources");

                //Resync tree so that it's removed & hides
                navigationService.syncTree({ tree: "datasource", path: ['-1'], forceReload: true, activate: false }).then(function (response) {

                    //Response object contains node object & activate bool
                    //Can then reload the root node -1 for this tree 'Forms Folder'
                    navigationService.reloadNode(response.node);
                });

                //Don't need to wire anything else up
                return;
            }
        });
    });

    if ($routeParams.create) {
	    //we are creating so get an empty data type item
	    dataSourceResource.getScaffold().then(function (response) {
			$scope.loaded = true;
			$scope.dataSource = response.data;

			dataSourceResource.getAllDataSourceTypesWithSettings()
		    .then(function (resp) {
		        $scope.types = resp.data;

		    });

			//set a shared state
			editorState.set($scope.form);
		});
    }
    else {
       
	        //we are editing so get the content item from the server
	        dataSourceResource.getByGuid($routeParams.id)
            .then(function (response) {

                $scope.dataSource = response.data;

                dataSourceResource.getAllDataSourceTypesWithSettings()
                    .then(function (resp) {
                        $scope.types = resp.data;
                        setTypeAndSettings();
    
                        $scope.loaded = true;
                    });



                //set a shared state
                editorState.set($scope.dataSource);
            });
	    }

	    $scope.setType = function () {
	        setTypeAndSettings();
	    };

	    $scope.save = function () {
	
	        //set settings
	        $scope.dataSource.settings = {};
	        angular.forEach($scope.dataSource.$type.settings, function (setting) {
	            var key = setting.alias;
	            var value = setting.value;
	            $scope.dataSource.settings[key] = value;
	           
	        });
	        //validate settings
	        dataSourceResource.validateSettings($scope.dataSource)
            .then(function (response) {

                $scope.errors = response.data;

                if ($scope.errors.length > 0) {
                    $scope.dataSource.valid = false;
                    angular.forEach($scope.errors, function (error) {

                        notificationsService.error("Datasource failed to save", error.Message);
                       
                    });
                } else {
                    //save
                    dataSourceResource.save($scope.dataSource)
                    .then(function (response) {

                        $scope.dataSource = response.data;
                        //set a shared state
                        editorState.set($scope.dataSource);
                        setTypeAndSettings();
                        navigationService.syncTree({ tree: "datasource", path: [String($scope.dataSource.id)], forceReload: true });
                        notificationsService.success("Datasource saved", "");
                        $scope.dataSource.valid = true;
                        $scope.dataSourceForm.$dirty = false;
                    }, function (err) {
                        notificationsService.error("Datasource failed to save", "");
                    });
                }


            }, function (err) {
                notificationsService.error("Datasource failed to save", "Please check if your settings are valid");
            });

	    };

	    $scope.showWizard = function() {
	        dialogService.open({
	            template: "/app_plugins/UmbracoForms/Backoffice/Datasource/dialogs/wizard.html",
	            dataSourceId: $scope.dataSource.id
            });
	    };

	    var setTypeAndSettings = function () {
	        $scope.dataSource.$type = _.where($scope.types, { id: $scope.dataSource.formDataSourceTypeId })[0];

	        //set settings
	        angular.forEach($scope.dataSource.settings, function (setting) {
	            for (var key in $scope.dataSource.settings) {
	                if ($scope.dataSource.settings.hasOwnProperty(key)) {
	                    if (_.where($scope.dataSource.$type.settings, { alias: key }).length > 0) {
	                        _.where($scope.dataSource.$type.settings, { alias: key })[0].value = $scope.dataSource.settings[key];
	                    }

	                }
	            }
	        });
	    };



	});
angular.module("umbraco")
.controller("UmbracoForms.Editors.DataSource.WizardController",
	function ($scope, $routeParams, dataSourceWizardResource, navigationService, notificationsService, dialogService) {

	    $scope.currentStep = 1;

	    dataSourceWizardResource.getScaffold($scope.dialogOptions.dataSourceId).then(function (response) {

	         $scope.wizard = response.data;

	         $scope.hasPrimaryKeys = $scope.wizard.mappings.length != _.where($scope.wizard.mappings, { prevalueKeyField: null }).length;

	         dataSourceWizardResource.getAllFieldTypes()
                 .then(function (resp) {
                     $scope.fieldtypes = resp.data;
                     $scope.ready = true;
                 });
	     });


	    $scope.createForm = function() {

	        dataSourceWizardResource.createForm($scope.wizard)
	            .then(function (resp) {
	                dialogService.closeAll();
	                notificationsService.success("Form created", "");
	            });
	    };

	    $scope.gotoStep = function (step) {
	        $scope.currentStep = step;
	    }

	    $scope.gotoThirdStep = function() {
	        if ($scope.hasPrimaryKeys) {
	            $scope.currentStep = 3;
	        } else {
	            $scope.currentStep = 4;
	        }
	    }
        $scope.goBackToThirdStep = function() {
            if ($scope.hasPrimaryKeys) {
                $scope.currentStep = 3;
            } else {
                $scope.currentStep = 2;
            }
        }
	});
angular.module("umbraco").controller("UmbracoForms.Editors.Form.CopyController",function ($scope, formResource, navigationService) {

	    //Copy Function run from button on click
	    $scope.copyForm = function (formId) {

	        //Perform copy in formResource
	        formResource.copy(formId, $scope.newFormName).then(function (response) {

	            var newFormId = response.data.id;

	            //Reload the tree (but do NOT mark the new item in the tree as selected/active)
	            navigationService.syncTree({ tree: "form", path: ["-1", String(newFormId)], forceReload: true, activate: false });

	            //Once 200 OK then reload tree & hide copy dialog navigation
	            navigationService.hideNavigation();
	        });
	    };

        //Cancel button - closes dialog
        $scope.cancelCopy = function() {
            navigationService.hideNavigation();
        }
	});
angular.module("umbraco").controller("UmbracoForms.Editors.Form.CreateController", function ($scope, $routeParams, formResource, editorState, notificationsService, utilityService) {
		
		//Use the vm approach as opposed to $scope
		var vm = this;
		vm.editUrl = 'edit';
		
		//Get the current umbraco version we are using
		var umbracoVersion = Umbraco.Sys.ServerVariables.application.version;
		
		var compareOptions = {
			zeroExtend: true
		};
		
		//Check what version of Umbraco we have is greater than 7.4 or not 
		//So we can load old or new editor UI
		var versionCompare = utilityService.compareVersions(umbracoVersion, "7.4", compareOptions);
		
		//If value is 0 then versions are an exact match
		//If 1 then we are greater than 7.4.x
		//If it's -1 then we are less than 7.4.x
		if(versionCompare < 0) {
			//I am less than 7.4 - load the legacy editor
			vm.editUrl = 'edit-legacy';
		}
		
		formResource.getAllTemplates().then(function(response) {
		   vm.formTemplates = response.data;
		});
});
angular.module("umbraco")
.controller("UmbracoForms.Editors.Form.DeleteController",
	function ($scope, formResource, navigationService, treeService) {
	    $scope.delete = function (id) {
	        formResource.deleteByGuid(id).then(function () {

	            treeService.removeNode($scope.currentNode);
	            navigationService.hideNavigation();

	        });

	    };
	    $scope.cancelDelete = function () {
	        navigationService.hideNavigation();
	    };
	});
angular.module("umbraco").controller("UmbracoForms.Editors.Form.EditController",

function ($scope, $routeParams, formResource, editorState, dialogService, formService, notificationsService, contentEditingHelper, formHelper, navigationService, userService, securityResource, localizationService, workflowResource) {

    //On load/init of 'editing' a form then
    //Let's check & get the current user's form security
    var currentUserId = null;
    var currentFormSecurity = null;

    //By default set to have access (in case we do not find the current user's per indivudal form security item)
    $scope.hasAccessToCurrentForm = true;

    $scope.displayEditor = true;

    $scope.page = {};

    $scope.page.navigation = [
    {
        "name": localizationService.localize("general_design"),
        "icon": "icon-document-dashed-line",
        "view": "/App_Plugins/UmbracoForms/Backoffice/Form/views/design/design.html",
        "active": true
    },
    {
        "name": "Settings",
        "icon": "icon-settings",
        "view": "/App_Plugins/UmbracoForms/Backoffice/Form/views/settings/settings.html"
    }];

    userService.getCurrentUser().then(function (response) {
        currentUserId = response.id;

        //Now we can make a call to form securityResource
        securityResource.getByUserId(currentUserId).then(function (response) {
            $scope.security = response.data;

            //Use _underscore.js to find a single item in the JSON array formsSecurity
            //where the FORM guid matches the one we are currently editing (if underscore does not find an item it returns an empty array)
            //As _.findWhere not in Umb .1.6 using _.where() that lists multiple matches - checking that we have only item in the array (ie one match)
            currentFormSecurity = _.where(response.data.formsSecurity, { Form: $routeParams.id });

            if (currentFormSecurity.length === 1) {
                //Check & set if we have access to the form
                //if we have no entry in the JSON array by default its set to true (so won't prevent)
                $scope.hasAccessToCurrentForm = currentFormSecurity[0].HasAccess;
            }

            //Check if we have access to current form OR manage forms has been disabled
            if (!$scope.hasAccessToCurrentForm || !$scope.security.userSecurity.manageForms) {

                //Show error notification
                notificationsService.error("Access Denied", "You do not have access to edit this form");


                //Resync tree so that it's removed & hides
                navigationService.syncTree({ tree: "form", path: ['-1'], forceReload: true, activate: false }).then(function(response) {

                    //Response object contains node object & activate bool
                    //Can then reload the root node -1 for this tree 'Forms Folder'
                    navigationService.reloadNode(response.node);
                });

                //Don't need to wire anything else up
                return;
            }
        });
    });


    if ($routeParams.create) {

		//we are creating so get an empty data type item
	    //formResource.getScaffold($routeParams.template)
        formResource.getScaffoldWithWorkflows($routeParams.template)
	        .then(function(response) {
	            $scope.form = response.data;

				//set a shared state
				editorState.set($scope.form);
			});

    } else {

		$scope.workflowsUrl = "#/forms/form/workflows/" +$routeParams.id;
		$scope.entriesUrl = "#/forms/form/entries/" +$routeParams.id;


		//we are editing so get the content item from the server
        formResource.getWithWorkflowsByGuid($routeParams.id)
			.then(function (response) {

			    //As we are editing an item we can highlight it in the tree
			    navigationService.syncTree({ tree: "form", path: [String($routeParams.id)], forceReload: false });

				$scope.form = response.data;
				$scope.saved = true;

                // this should be removed in next major version
                angular.forEach($scope.form.pages, function(page){
                    angular.forEach(page.fieldSets, function(fieldSet){
                        angular.forEach(fieldSet.containers, function(container){
                            angular.forEach(container.fields, function(field){
                                field.removePrevalueEditor = true;
                            });
                        });
                    });
                });

				//set a shared state
				editorState.set($scope.form);
			}, function(reason) {
                //Includes ExceptionMessage, StackTrace etc from the WebAPI
                var jsonErrorResponse = reason.data;
                
                //Show notification message, a sticky Error message
                notificationsService.add({ headline: "Unable to load form", message: jsonErrorResponse.ExceptionMessage, type: 'error', sticky: true  });
                
                //Hide the entire form UI
                $scope.displayEditor = false;
            });


	}

	$scope.editForm = function(form, section){
		dialogService.open(
			{
				template: "/app_plugins/UmbracoForms/Backoffice/Form/dialogs/formsettings.html",
				form: form,
				section: section,
				page: $scope.currentPage
			});
	};

	$scope.save = function(){
	    if (formHelper.submitForm({ scope: $scope })) {

            $scope.page.saveButtonState = "busy";

	        //make sure we set correct widths on all containers
	        formService.syncContainerWidths($scope.form);

            formResource.saveWithWorkflows($scope.form).then(function (response) {
	            formHelper.resetForm({ scope: $scope });

	            contentEditingHelper.handleSuccessfulSave({
	                scope: $scope,
	                savedContent: response.data
	            });

	            $scope.ready = true;

	            //set a shared state
	            editorState.set($scope.form);

	            $scope.page.saveButtonState = "success";
	            navigationService.syncTree({ tree: "form", path: [String($scope.form.id)], forceReload: true });
	            notificationsService.success("Form saved", "");

	        }, function (err) {

                contentEditingHelper.handleSaveError({
                        redirectOnFailure: false,
                        err: err
                    });

                $scope.page.saveButtonState = "error";


	        });
	    }

	};


});

angular.module("umbraco").controller("UmbracoForms.Editors.Form.EditLegacyController",

function ($scope, $routeParams, formResource, editorState, dialogService, formService, notificationsService, contentEditingHelper, formHelper, navigationService, userService, securityResource) {

    //On load/init of 'editing' a form then
    //Let's check & get the current user's form security
    var currentUserId = null;
    var currentFormSecurity = null;

    //By default set to have access (in case we do not find the current user's per indivudal form security item)
    $scope.hasAccessToCurrentForm = true;

    userService.getCurrentUser().then(function (response) {
        currentUserId = response.id;

        //Now we can make a call to form securityResource
        securityResource.getByUserId(currentUserId).then(function (response) {
            $scope.security = response.data;

            //Use _underscore.js to find a single item in the JSON array formsSecurity
            //where the FORM guid matches the one we are currently editing (if underscore does not find an item it returns an empty array)
            //As _.findWhere not in Umb .1.6 using _.where() that lists multiple matches - checking that we have only item in the array (ie one match)
            currentFormSecurity = _.where(response.data.formsSecurity, { Form: $routeParams.id });

            if (currentFormSecurity.length === 1) {
                //Check & set if we have access to the form
                //if we have no entry in the JSON array by default its set to true (so won't prevent)
                $scope.hasAccessToCurrentForm = currentFormSecurity[0].HasAccess;
            }

            //Check if we have access to current form OR manage forms has been disabled
            if (!$scope.hasAccessToCurrentForm || !$scope.security.userSecurity.manageForms) {

                //Show error notification
                notificationsService.error("Access Denied", "You do not have access to edit this form");


                //Resync tree so that it's removed & hides
                navigationService.syncTree({ tree: "form", path: ['-1'], forceReload: true, activate: false }).then(function(response) {

                    //Response object contains node object & activate bool
                    //Can then reload the root node -1 for this tree 'Forms Folder'
                    navigationService.reloadNode(response.node);
                });

                //Don't need to wire anything else up
                return;
            }
        });
    });


    if ($routeParams.create) {

		//we are creating so get an empty data type item
	    formResource.getScaffold($routeParams.template)
	        .then(function(response) {
	            $scope.form = response.data;
				$scope.currentPage = {};

	            formResource.getPrevalueSources()
	                .then(function(resp){
	                    $scope.prevaluesources = resp.data;
	            });

				formResource.getAllFieldTypesWithSettings()
					.then(function (resp) {
						$scope.fieldtypes = resp.data;
						$scope.ready = true;
					});

				//set a shared state
				editorState.set($scope.form);
			});

    } else {

		$scope.workflowsUrl = "#/forms/form/workflows/" +$routeParams.id;
		$scope.entriesUrl = "#/forms/form/entries/" +$routeParams.id;


		//we are editing so get the content item from the server
		formResource.getByGuid($routeParams.id)
			.then(function (response) {

			    //As we are editing an item we can highlight it in the tree
			    navigationService.syncTree({ tree: "form", path: [String($routeParams.id)], forceReload: false });


				$scope.form = response.data;
				$scope.saved = true;

				formResource.getPrevalueSources()
	                .then(function (resp) {
	                    $scope.prevaluesources = resp.data;
	                });

				formResource.getAllFieldTypesWithSettings()
					.then(function (resp) {
						$scope.fieldtypes = resp.data;
						$scope.ready = true;
					});

				//set a shared state
				editorState.set($scope.form);
			});


	}

	$scope.editForm = function(form, section){
		dialogService.open(
			{
				template: "/app_plugins/UmbracoForms/Backoffice/Form/dialogs/formsettings.html",
				form: form,
				section: section,
				page: $scope.currentPage
			});
	};

	$scope.save = function(){

	    if (formHelper.submitForm({ scope: $scope })) {
	        //make sure we set correct widths on all containers
	        formService.syncContainerWidths($scope.form);

	        formResource.save($scope.form).then(function (response) {

	            formHelper.resetForm({ scope: $scope });

	            contentEditingHelper.handleSuccessfulSave({
	                scope: $scope,
	                savedContent: response.data
	            });

	            $scope.ready = true;
	            //$scope.form = response.data;

	            //set a shared state
	            editorState.set($scope.form);

	            navigationService.syncTree({ tree: "form", path: [String($scope.form.id)], forceReload: true });

	            notificationsService.success("Form saved", "");

	        }, function (err) {
	            notificationsService.error("Form Failed to save", err.data.Message);
	        });
	    }

	};


});

angular.module("umbraco").controller("UmbracoForms.Editors.Form.EntriesController", function ($scope, $routeParams, recordResource, formResource, dialogService, editorState, userService, securityResource, notificationsService, navigationService) {

    //On load/init of 'editing' a form then
    //Let's check & get the current user's form security
    var currentUserId = null;
    var currentFormSecurity = null;

    var vm = this;
    vm.pagination = {
        pageNumber: 1,
        totalPages:1
    };
    vm.allIsChecked = false;
    vm.selectedEntry = {};
    vm.showEntryDetails = false;
    vm.userLocale = "";

    vm.nextPage = nextPage;
    vm.prevPage = prevPage;
    vm.goToPageNumber = goToPageNumber;
    vm.viewEntryDetails = viewEntryDetails;
    vm.closeEntryDetails = closeEntryDetails;
    vm.nextEntryDetails = nextEntryDetails;
    vm.prevEntryDetails = prevEntryDetails;
    vm.datePickerChange = datePickerChange;
    vm.toggleRecordState = toggleRecordState;

    vm.keyboardShortcutsOverview = [

        {
            "name": "Entry details",
            "shortcuts": [
                {
                    "description": "Next entry",
                    "keys": [
                        {
                            "key": "???"
                        }
                    ]
                },
                {
                    "description": "Previous entry",
                    "keys": [
                        {
                            "key": "???"
                        }
                    ]
                },
                {
                    "description": "Close details",
                    "keys": [
                        {
                            "key": "esc"
                        }
                    ]
                }
            ]
        }

    ];

    //By default set to have access (in case we do not find the current user's per indivudal form security item)
    $scope.hasAccessToCurrentForm = true;

    userService.getCurrentUser().then(function (response) {
        currentUserId = response.id;
        vm.userLocale = response.locale;

        //Now we can make a call to form securityResource
        securityResource.getByUserId(currentUserId).then(function (response) {
            $scope.security = response.data;

            //Use _underscore.js to find a single item in the JSON array formsSecurity
            //where the FORM guid matches the one we are currently editing (if underscore does not find an item it returns undefinied)
            currentFormSecurity = _.where(response.data.formsSecurity, { Form: $routeParams.id });

            if (currentFormSecurity.length === 1) {
                //Check & set if we have access to the form
                //if we have no entry in the JSON array by default its set to true (so won't prevent)
                $scope.hasAccessToCurrentForm = currentFormSecurity[0].HasAccess;
            }

            //Check if we have access to current form OR manage forms has been disabled
            if (!$scope.hasAccessToCurrentForm || !$scope.security.userSecurity.manageForms) {

                //Show error notification
		        notificationsService.error("Access Denied", "You do not have access to view this form's entries");

                //Resync tree so that it's removed & hides
                navigationService.syncTree({ tree: "form", path: ['-1'], forceReload: true, activate: false }).then(function (response) {

                    //Response object contains node object & activate bool
                    //Can then reload the root node -1 for this tree 'Forms Folder'
                    navigationService.reloadNode(response.node);
                });

                //Don't need to wire anything else up
                return;
            }
        });
    });


	formResource.getByGuid($routeParams.id)
		.then(function(response){
			$scope.form = response.data;
			$scope.loaded = true;

		    //As we are editing an item we can highlight it in the tree
			navigationService.syncTree({ tree: "form", path: [String($routeParams.id), String($routeParams.id) + "_entries"], forceReload: false });

		});

	$scope.states = [
        {
            "name": "Approved",
            "isChecked": true
        },
        {
            "name": "Submitted",
            "isChecked": true
        }
    ];

	$scope.filter = {
		startIndex: 1, //Page Number
		length: 20, //No per page
		form: $routeParams.id,
		sortBy: "created",
		sortOrder: "descending",
		states: ["Approved","Submitted"]
	};

	$scope.records = [];

	//Default value
	$scope.loading = false;

	recordResource.getRecordSetActions().then(function(response){
	    $scope.recordSetActions = response.data;
	    $scope.recordActions = response.data;
	});


	$scope.toggleRecordStateSelection = function(recordState) {
	    var idx = $scope.filter.states.indexOf(recordState);

	    // is currently selected
	    if (idx > -1) {
	        $scope.filter.states.splice(idx, 1);
	    }

	        // is newly selected
	    else {
	        $scope.filter.states.push(recordState);
	    }
	};

	$scope.hiddenFields = [2];
	$scope.toggleSelection = function toggleSelection(field) {
	    var idx = $scope.hiddenFields.indexOf(field);

	    // is currently selected
	    if (idx > -1) {
	      $scope.hiddenFields.splice(idx, 1);
	    }else {
	      $scope.hiddenFields.push(field);
	    }
	};


	$scope.edit = function(schema){
	    dialogService.open(
	            {
	                template: "/app_plugins/UmbracoForms/Backoffice/Form/dialogs/entriessettings.html",
	                schema: schema,
	                toggle: $scope.toggleSelection,
	                hiddenFields: $scope.hiddenFields,
					filter: $scope.filter
	            });
	};

	$scope.viewdetail = function(schema, row, event){
		dialogService.open(
				{
					template: "/app_plugins/UmbracoForms/Backoffice/Form/dialogs/entriesdetail.html",
					schema: schema,
					row: row,
					hiddenFields: $scope.hiddenFields
				});

        if(event) {
            event.stopPropagation();
        }

	};

	//$scope.pagination = [];


	function nextPage(pageNumber) {
		$scope.filter.startIndex++;
        $scope.loadRecords($scope.filter);
	}

	function prevPage(pageNumber) {
		$scope.filter.startIndex--;
        $scope.loadRecords($scope.filter);
	}

	function goToPageNumber(pageNumber) {
		// do magic here
		$scope.filter.startIndex = pageNumber;
        $scope.loadRecords($scope.filter);
	}

    function viewEntryDetails(schema, entry, event) {

        vm.selectedEntry = {};

        var entryIndex = $scope.records.results.indexOf(entry);
        // get the count of the entry across the pagination: entries pr page * page index + entry index
        var entryCount =  $scope.filter.length * ($scope.filter.startIndex - 1) + (entryIndex + 1);

        vm.selectedEntry = entry;
        vm.selectedEntry.index = entryIndex;
        vm.selectedEntry.entryCount = entryCount;
        vm.selectedEntry.details = [];

        if(schema && entry){
            for (var index = 0; index < schema.length; index++) {
                var schemaItem = schema[index];

                //Select the value from the entry.fields array
                var valueItem = entry.fields[index];

                //Create new object to push into details above (so our angular view is much neater)
                var itemToPush = {
                    name: schemaItem.name,
                    value: valueItem,
                    viewName: schemaItem.view,
                    view: '/app_plugins/umbracoforms/Backoffice/common/rendertypes/' + schemaItem.view + '.html'
                };

                var excludeItems = ["member", "state", "created", "updated"];
                var found = excludeItems.indexOf(schemaItem.id);

                if(excludeItems.indexOf(schemaItem.id) === -1) {
                    vm.selectedEntry.details.push(itemToPush);
                }

            }
        }

        vm.showEntryDetails = true;

        if(event) {
            event.stopPropagation();
        }
    }

    function closeEntryDetails() {
        vm.selectedEntry = {};
        vm.showEntryDetails = false;
    }

    function nextEntryDetails() {

        // get the current index and plus 1 to get the next item in the array
        var nextEntryIndex = vm.selectedEntry.index + 1;
        var entriesCount = $scope.records.results.length;
        var currentPage = $scope.filter.startIndex;
        var totalNumberOfPages = $scope.records.totalNumberOfPages;

        if(nextEntryIndex < entriesCount) {

            var entry = $scope.records.results[nextEntryIndex];
            viewEntryDetails($scope.records.schema, entry);

        } else if( totalNumberOfPages > 1 && currentPage < totalNumberOfPages) {

            $scope.filter.startIndex++;
            vm.pagination.pageNumber++;

            recordResource.getRecords($scope.filter).then(function(response){
                $scope.records = response.data;
                $scope.allIsChecked =  ($scope.selectedRows.length >= $scope.records.results.length);
                vm.pagination.totalPages = response.data.totalNumberOfPages;

                limitRecordFields($scope.records);

                // get the first item from the new collection
                var entry = $scope.records.results[0];
                viewEntryDetails($scope.records.schema, entry);

            });

        }

    }

    function prevEntryDetails() {


        var prevEntryIndex = vm.selectedEntry.index - 1;
        var totalNumberOfPages = $scope.records.totalNumberOfPages;
        var currentPage = $scope.filter.startIndex;

        if(vm.selectedEntry.index > 0) {

            var entry = $scope.records.results[prevEntryIndex];
            viewEntryDetails($scope.records.schema, entry);

        } else if(totalNumberOfPages > 1 && currentPage !== 1) {

            $scope.filter.startIndex--;
            vm.pagination.pageNumber--;

            recordResource.getRecords($scope.filter).then(function(response){
                $scope.records = response.data;
                $scope.allIsChecked =  ($scope.selectedRows.length >= $scope.records.results.length);
                vm.pagination.totalPages = response.data.totalNumberOfPages;

                limitRecordFields($scope.records);

                // get the last item from the new collection
                var lastEntryIndex = $scope.records.results.length - 1;
                var entry = $scope.records.results[lastEntryIndex];
                viewEntryDetails($scope.records.schema, entry);

            });

        }
    }

    function datePickerChange(dateRange) {
        $scope.filter.startDate = dateRange.startDate;
        $scope.filter.endDate = dateRange.endDate;
        $scope.filterChanged();
    }

    function toggleRecordState(recordState) {
        if(recordState.isChecked) {
            $scope.filter.states.push(recordState.name);
        } else {
            var index = $scope.filter.states.indexOf(recordState.name);
            if(index !== -1) {
                $scope.filter.states.splice(index, 1);
            }
        }
        $scope.filterChanged();
    }

	$scope.next = function(){
		$scope.filter.startIndex++;
	};

	$scope.prev = function(){
		$scope.filter.startIndex--;
	};

	$scope.goToPage = function(index){
		$scope.filter.startIndex = index;
	};


	$scope.search = _.debounce(function(resetIndex){

		//Set loading to true
		$scope.loading = true;

		$scope.reset(resetIndex);

		$scope.$apply(function(){
			recordResource.getRecords($scope.filter).then(function(response){
				//Got results back - set loading to false]
				$scope.loading = false;

				$scope.records = response.data;
				vm.pagination.totalPages = response.data.totalNumberOfPages;

                limitRecordFields($scope.records);

			});
		});


	}, 300);


    $scope.filterChanged = function() {
        var resetIndex = true;
        $scope.search(resetIndex);
    };

	$scope.loadRecords = function(filter, append){

		//Set loading to true
		$scope.loading = true;

		recordResource.getRecords(filter).then(function(response){
			//Got response from server
			$scope.loading = false;

			if(append){
				$scope.records = $scope.records.results.concat(response.data.results);
			}else{
				$scope.records = response.data;
			}

			$scope.allIsChecked =  ($scope.selectedRows.length >= $scope.records.results.length);

            limitRecordFields($scope.records);

			vm.pagination.totalPages = response.data.totalNumberOfPages;

		});
	};

    $scope.loadRecords($scope.filter);

    function limitRecordFields(records) {
        // function to limit how many fields are
        // shown in the entries table

        var falseFromIndex = 2;
        var falseToIndex =  records.schema.length - 4;
        var trueFalseArray = [];

        // make array of true/false
        angular.forEach(records.schema, function(schema, index){
            if(index <= falseFromIndex || index >= falseToIndex) {
                trueFalseArray.push(true);
            } else {
                trueFalseArray.push(false);
            }
        });

        // set array for schema
        records.showSchemaArray = trueFalseArray;

        // set array for row fields
        angular.forEach(records.results, function(result){
            result.showRecordsArray = trueFalseArray;
        });
    }

	$scope.reset = function(resetIndex){
		$scope.selectedRows.length = 0;
		$scope.allIsChecked = false;

		if(resetIndex){
			$scope.filter.startIndex = 1;
		}

	};

    $scope.clearSelection = function() {
        $scope.selectedRows.length = 0;
        vm.allIsChecked = false;

        for(var i = 0; i <  $scope.records.results.length; i++) {
            var row = $scope.records.results[i];
            row.selected = false;
        }
    };

	$scope.more = function(){
		$scope.filter.startIndex++;
		$scope.loadRecords($scope.filter, true);
	};

	$scope.selectedRows = [];

    $scope.toggleRow = function(row) {
        row.selected = !row.selected;
        if(row.selected){
            $scope.selectedRows.push(row.id);
            $scope.allIsChecked =  ($scope.selectedRows.length >= $scope.records.results.length);
        }else{
            var i = $scope.selectedRows.indexOf(row.id);
            $scope.selectedRows.splice(i,1);
            $scope.allIsChecked = false;
        }
    };

	$scope.toggleRowLegacy = function(row){
		if(row.selected){
			$scope.selectedRows.push(row.id);
			$scope.allIsChecked =  ($scope.selectedRows.length >= $scope.records.results.length);
		}else{
			var i = $scope.selectedRows.indexOf(row.id);
			$scope.selectedRows.splice(i,1);
			$scope.allIsChecked = false;
		}
	};

	$scope.allIsChecked = false;
	$scope.toggleAllLegacy = function($event){
		var checkbox = $event.target;
		$scope.selectedRows.length = 0;

		for (var i = 0; i < $scope.records.results.length; i++) {
			var entity = $scope.records.results[i];
			entity.selected = checkbox.checked;

			if(checkbox.checked){
				$scope.selectedRows.push(entity.id);
			}
		}
	};

	$scope.toggleAll = function(allIsChecked){

		$scope.selectedRows.length = 0;

		for (var i = 0; i < $scope.records.results.length; i++) {
			var entity = $scope.records.results[i];
			entity.selected = allIsChecked;

			if(allIsChecked){
				$scope.selectedRows.push(entity.id);
			}
		}
	};

	$scope.executeRecordSetAction = function (action) {

        //Get the data we need in order to send to the API Endpoint
	    var model = {
	        formId: $scope.form.id,
	        recordKeys: $scope.selectedRows,
	        actionId: action.id
	    };

	    //Check if the action we are running requires a JS Confirm Box along with a message to be displayed
	    if (action.needsConfirm && action.confirmMessage.length > 0) {

	        //Display the confirm box with the confirmMessage
	        var result = confirm(action.confirmMessage);

	        if (!result) {
	            //The user clicked cancel
	            //Stop the rest of the function running
	            return;
	        }
	    }

	    //We do not need to show a confirm message so excute the action immediately
	    recordResource.executeRecordSetAction(model).then(function (response) {
	        $scope.reset(true);
	        $scope.loadRecords($scope.filter, false);

	        //Show success notification that action excuted
	        notificationsService.success("Excuted Action", "Successfully excuted action " + action.name);

	    }, function (err) {
	        //Error Function - so get an error response from API
	        notificationsService.error("Excuted Action", "Failed to excute action " + action.name + " due to error: " + err);
	    });


	};
});

angular.module("umbraco").controller("UmbracoForms.Editors.Form.EntriesSettingsController",
    function($scope, $log, $timeout, exportResource){

       //The Form ID is found in the filter object we pass into the dialog
       var formId = $scope.dialogOptions.filter.form;
        
        exportResource.getExportTypes(formId).then(function(response){
            $scope.exportTypes = response.data;
        });

        $scope.export = function(type, filter){
            filter.exportType = type.id;
            
            exportResource.generateExport(filter).then(function(response){

                var url = exportResource.getExportUrl(response.data.formId, response.data.fileName);
                
                var iframe = document.createElement('iframe');
                iframe.id = "hiddenDownloadframe";
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                iframe.src= url;

                //remove all traces
                $timeout(function(){
                    document.body.removeChild(iframe);
                }, 1000);
                
            });
        };

    });

angular.module("umbraco").controller("UmbracoForms.Editors.Form.Dialogs.FieldsetSettingController",
	function ($scope, formService, dialogService) {

	    $scope.deleteConditionRule = function(rules, rule) {
	        formService.deleteConditionRule(rules, rule);
	    };

	    $scope.addConditionRule = function (condition) {
	        formService.addConditionRule(condition);
	    };

        $scope.close = function() {
            dialogService.closeAll();
        }
	}
);

angular.module("umbraco").controller("UmbracoForms.Editors.Form.Dialogs.FieldSettingController",
	function ($scope, formService, dialogService) {

	    $scope.deleteConditionRule = function(rules, rule) {
	        formService.deleteConditionRule(rules, rule);
	    };

	    $scope.addConditionRule = function (condition) {
	        formService.addConditionRule(condition);
	    };

	    $scope.getPrevalues = function (field) {
	        
	        formService.loadFieldTypePrevalues(field);

	    };

        $scope.close = function() {
            
            $scope.dialogOptions.field.settings = {};
            angular.forEach($scope.dialogOptions.field.$fieldType.settings, function (setting) {
                var key = setting.alias;
                var value = setting.value;
                $scope.dialogOptions.field.settings[key] = value;
                dialogService.closeAll();
            });
        }
	});

angular.module("umbraco").controller("UmbracoForms.Editors.Form.WorkflowsController", function ($scope, $routeParams, workflowResource, editorState, dialogService, $window, userService, securityResource, notificationsService, navigationService) {

       
    //On load/init of 'editing' a form then
    //Let's check & get the current user's form security
        var currentUserId = null;
        var currentFormSecurity = null;

    //By default set to have access (in case we do not find the current user's per indivudal form security item)
        $scope.hasAccessToCurrentForm = true;

        userService.getCurrentUser().then(function (response) {
            currentUserId = response.id;

            //Now we can make a call to form securityResource
            securityResource.getByUserId(currentUserId).then(function (response) {
                $scope.security = response.data;

                //Use _underscore.js to find a single item in the JSON array formsSecurity 
                //where the FORM guid matches the one we are currently editing (if underscore does not find an item it returns undefinied)
                currentFormSecurity = _.where(response.data.formsSecurity, { Form: $routeParams.id });

                if (currentFormSecurity.length === 1) {
                    //Check & set if we have access to the form
                    //if we have no entry in the JSON array by default its set to true (so won't prevent)
                    $scope.hasAccessToCurrentForm = currentFormSecurity[0].HasAccess;
                }

               //Check if we have access to current form OR manage forms has been disabled
                if (!$scope.hasAccessToCurrentForm || !$scope.security.userSecurity.manageWorkflows || !$scope.security.userSecurity.manageForms) {
                    
                    //Show error notification
                    notificationsService.error("Access Denied", "You do not have access to edit this form's workflow");

                    //Resync tree so that it's removed & hides
                    navigationService.syncTree({ tree: "form", path: ['-1'], forceReload: true, activate: false }).then(function (response) {

                        //Response object contains node object & activate bool
                        //Can then reload the root node -1 for this tree 'Forms Folder'
                        navigationService.reloadNode(response.node);
                    });

                    //Don't need to wire anything else up
                    return;
                }
            });
        });
        
        workflowResource.getAllWorkflows($routeParams.id)
            .then(function(resp) {
                $scope.workflows = resp.data;
                $scope.loaded = true;

                //As we are editing an item we can highlight it in the tree
                navigationService.syncTree({ tree: "form", path: [String($routeParams.id), String($routeParams.id) + "_workflows"], forceReload: true });

            }, function(reason) {
                //Includes ExceptionMessage, StackTrace etc from the WebAPI
                var jsonErrorResponse = reason.data;
                
                //Show notification message, a sticky Error message
                notificationsService.add({ headline: "Unable to load form", message: jsonErrorResponse.ExceptionMessage, type: 'error', sticky: true  });
                
                //Hide the entire workflows UI
                $scope.loaded = false;
            });

        $scope.sortableOptions = {
            handle: '.handle',
            cursor: "move",
            connectWith: '.workflows',
            update: function (e, ui) {
                var wfGuids = [];
                var wfcount = 0;
                var state = ui.item.parent().attr("rel");
                ui.item.parent().children().each(function () {
                    if ($(this).attr("rel") != null) {
                        wfGuids[wfcount] = $(this).attr("rel");
                        wfcount++;
                    }
                });

                workflowResource.updateSortOrder(state,wfGuids).then(function () {


                });

            },
        };

        $scope.deleteWorkflow = function (workflow) {
            var deleteWorkflow = $window.confirm('Are you sure you want to delete the workflow?');

            if (deleteWorkflow) {
                workflowResource.deleteByGuid(workflow.id).then(function() {
                    $scope.workflows.splice($scope.workflows.indexOf(workflow), 1);

                });
            }
        };

        $scope.updateWorkflow = function(state, workflow) {
            data = {};
            data.workflow = workflow;
            data.state = state;
            data.form = $routeParams.id;
            data.add = false;

            dialogService.open({
                template: '/app_plugins/UmbracoForms/Backoffice/Form/dialogs/workflow.html',
                show: true,
                callback: update,
                dialogData: data,
                workflows: $scope.workflows
        });
        };

        $scope.addWorkflow = function(state) {
            data = {};
            data.state = state;
            data.form = $routeParams.id;
            data.add = true;

            dialogService.open({
                template: '/app_plugins/UmbracoForms/Backoffice/Form/dialogs/workflow.html',
                show: true,
                callback: add,
                dialogData: data
            });
        };

        function add(data) {

            $scope.workflows.push(data);
        }

        function update(data) {
            
        }
    });
angular.module("umbraco").controller("UmbracoForms.Editors.Form.Dialogs.WorkflowsController",
	function ($scope, $routeParams, workflowResource, dialogService, notificationsService, $window) {

	    if ($scope.dialogData.workflow) {
	        //edit
	        $scope.workflow = $scope.dialogData.workflow;
	        workflowResource.getAllWorkflowTypesWithSettings()
	            .then(function (resp) {
	                $scope.types = resp.data;
	                setTypeAndSettings();
	            });

	        //workflowResource.getByGuid($scope.dialogData.workflow)
            //.then(function (response) {

            //    $scope.workflow = response.data;

            //    workflowResource.getAllWorkflowTypesWithSettings()
            //        .then(function (resp) {
            //            $scope.types = resp.data;
            //            setTypeAndSettings();
            //        });
                
            //});

	    } else {
	        //create
	        workflowResource.getScaffold()
	            .then(function(response) {
	                $scope.loaded = true;
	                $scope.workflow = response.data;
	                $scope.workflow.executesOn = $scope.dialogData.state;
	                $scope.workflow.form = $scope.dialogData.form;
	                $scope.workflow.active = true;

	                workflowResource.getAllWorkflowTypesWithSettings()
	                    .then(function(resp) {
	                        $scope.types = resp.data;

	                    });

	            });
	    }


	    $scope.setType = function () {
	        setTypeAndSettings();
	    };

	    $scope.close = function () {
	       
	        dialogService.closeAll();
	    };

	    $scope.add = function () {
	       
	        save();
	        
	    };

	    $scope.update = function () {
	       
	        save();
	        
	    };

        $scope.delete = function() {
            var deleteWorkflow = $window.confirm('Are you sure you want to delete the workflow?');

            if (deleteWorkflow) {
                workflowResource.deleteByGuid($scope.workflow.id).then(function () {
                    $scope.dialogOptions.workflows.splice($scope.dialogOptions.workflows.indexOf($scope.workflow), 1);

                    notificationsService.success("Workflow deleted", "");
                    //$scope.submit($scope.workflow);
                    dialogService.closeAll();

                });
            }
        }

	    var save = function() {
	        //set settings
	        $scope.workflow.settings = {};
	        angular.forEach($scope.workflow.$type.settings, function (setting) {
	            var key = setting.alias;
	            var value = setting.value;
	            $scope.workflow.settings[key] = value;
	        });
	        //validate settings
	        workflowResource.validateSettings($scope.workflow)
                .then(function (response) {

                    $scope.errors = response.data;

                    if ($scope.errors.length > 0) {
                        angular.forEach($scope.errors, function (error) {

                            notificationsService.error("Workflow failed to save", error.Message);
                        });
                    } else {
                        //save
                        workflowResource.save($scope.workflow)
                        .then(function (response) {

                            $scope.workflow = response.data;
                           
                            setTypeAndSettings();
                           
                            notificationsService.success("Workflow saved", "");
                            $scope.submit($scope.workflow);
                            dialogService.closeAll();

                        }, function (err) {
                            notificationsService.error("Workflow failed to save", "");
                        });
                    }

                }, function (err) {
                    notificationsService.error("Workflow failed to save", "Please check if your settings are valid");
                });
	    };

	    var setTypeAndSettings = function () {
	        $scope.workflow.$type = _.where($scope.types, { id: $scope.workflow.workflowTypeId })[0];
	        if (!$scope.workflow.name) {
	            $scope.workflow.name = $scope.workflow.$type.name;
	        }
	        //set settings
	        angular.forEach($scope.workflow.settings, function (setting) {
	            for (var key in $scope.workflow.settings) {
	                if ($scope.workflow.settings.hasOwnProperty(key)) {
	                    if (_.where($scope.workflow.$type.settings, { alias: key }).length > 0) {
	                        _.where($scope.workflow.$type.settings, { alias: key })[0].value = $scope.workflow.settings[key];
	                    }

	                }
	            }
	        });
	    };
	});
/**
 * @ngdoc controller
 * @name UmbracoForms.Overlays.FieldsetSettingsOverlay
 * @function
 *
 * @description
 * The controller for the Fieldset Settings dialog
 */

(function() {
    "use strict";

    function FieldsetSettingsOverlay($scope, formService) {

        var vm = this;

        vm.actionTypes = [];
        vm.logicTypes = [];
        vm.operators = [];

        vm.deleteConditionRule = deleteConditionRule;
        vm.addConditionRule = addConditionRule;
        vm.conditionFieldSelected = conditionFieldSelected;
        vm.addColumn = addColumn;
        vm.removeColumn = removeColumn;

        function init() {
            vm.actionTypes = formService.getActionTypes();
            vm.logicTypes = formService.getLogicTypes();
            vm.operators = formService.getOperators();

            if(!$scope.model.fieldset.condition) {
                $scope.model.fieldset.condition = {};
                $scope.model.fieldset.condition.actionType = vm.actionTypes[0].value;
                $scope.model.fieldset.condition.logicType = vm.logicTypes[0].value;
            }
        }

        function deleteConditionRule (rules, rule) {
	        formService.deleteConditionRule(rules, rule);
	    }

	    function addConditionRule(condition) {
	        formService.addEmptyConditionRule(condition);
            // set default operator
            var lastIndex = condition.rules.length - 1;
            condition.rules[lastIndex].operator = vm.operators[0].value;
	    }

        function conditionFieldSelected(selectedField, rule) {
            formService.populateConditionRulePrevalues(selectedField, rule, $scope.model.fields);
        }

        function addColumn() {
            var index = $scope.model.fieldset.containers.length;
            formService.addContainer($scope.model.fieldset, index);
        }

        function removeColumn(container) {
            formService.deleteContainer($scope.model.fieldset, container);
        }

        init();
    }

    angular.module("umbraco").controller("UmbracoForms.Overlays.FieldsetSettingsOverlay", FieldsetSettingsOverlay);

})();

/**
 * @ngdoc controller
 * @name UmbracoForms.Overlays.FieldSettingsOverlay
 * @function
 *
 * @description
 * The controller for the Field Settings dialog
 */

(function() {
    "use strict";

    function FieldSettingsOverlay($scope, localizationService, formService) {

        var vm = this;

        vm.showValidationPattern = false;
        vm.focusOnPatternField = false;
        vm.focusOnMandatoryField = false;
        vm.selectedValidationType = {};
        vm.actionTypes = [];
        vm.logicTypes = [];
        vm.operators = [];
        vm.validationTypes = [{
            "name": localizationService.localize("validation_validateAsEmail"),
            "key": "email",
            "pattern": "[a-zA-Z0-9_\.\+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-\.]+",
            "enableEditing": true
        }, {
            "name": localizationService.localize("validation_validateAsNumber"),
            "key": "number",
            "pattern": "^[0-9]*$",
            "enableEditing": true
        }, {
            "name": localizationService.localize("validation_validateAsUrl"),
            "key": "url",
            "pattern": "https?\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}",
            "enableEditing": true
        }, {
            "name": localizationService.localize("validation_enterCustomValidation"),
            "key": "custom",
            "pattern": "",
            "enableEditing": true
        }];



        vm.changeValidationType = changeValidationType;
        vm.changeValidationPattern = changeValidationPattern;
        vm.openFieldTypePickerOverlay = openFieldTypePickerOverlay;
        vm.deleteConditionRule = deleteConditionRule;
        vm.addConditionRule = addConditionRule;
        vm.getPrevalues = getPrevalues;
        vm.conditionFieldSelected = conditionFieldSelected;

        function activate() {
            vm.actionTypes = formService.getActionTypes();
            vm.logicTypes = formService.getLogicTypes();
            vm.operators = formService.getOperators();

            if(!$scope.model.field.condition) {
                $scope.model.field.condition = {};
                $scope.model.field.condition.actionType = vm.actionTypes[0].value;
                $scope.model.field.condition.logicType = vm.logicTypes[0].value;
            }

            matchValidationType();
        }

        function changeValidationPattern() {
            matchValidationType();
        }

        function openFieldTypePickerOverlay(field) {

            vm.focusOnMandatoryField = false;

            vm.fieldTypePickerOverlay = {
                view: "/app_plugins/UmbracoForms/Backoffice/Form/overlays/fieldtypepicker/field-type-picker.html",
                title: "Choose answer type",
                hideSubmitButton: true,
                show: true,
                submit: function(model) {

                    formService.loadFieldTypeSettings(field, model.fieldType);

                    // this should be removed in next major version
                    field.removePrevalueEditor = true;

                    vm.fieldTypePickerOverlay.show = false;
                    vm.fieldTypePickerOverlay = null;
                }
            };

        }

        function matchValidationType() {

            if ($scope.model.field.regex !== null && $scope.model.field.regex !== "" && $scope.model.field.regex !== undefined) {

                var match = false;

                // find and show if a match from the list has been chosen
                angular.forEach(vm.validationTypes, function(validationType, index) {
                    if ($scope.model.field.regex === validationType.pattern) {
                        vm.selectedValidationType = validationType;
                        vm.showValidationPattern = true;
                        match = true;
                    }
                });

                // if there is no match - choose the custom validation option.
                if (!match) {
                    angular.forEach(vm.validationTypes, function(validationType) {
                        if (validationType.key === "custom") {
                            vm.selectedValidationType = validationType;
                            vm.showValidationPattern = true;
                        }
                    });
                }
            }

        }

        function changeValidationType(selectedValidationType) {

            if (selectedValidationType) {
                $scope.model.field.regex = selectedValidationType.pattern;
                vm.showValidationPattern = true;

                // set focus on textarea
                if (selectedValidationType.key === "custom") {
                    vm.focusOnPatternField = true;
                }

            } else {
                $scope.model.field.regex = "";
                vm.showValidationPattern = false;
            }

        }

        function conditionFieldSelected(selectedField, rule) {
            formService.populateConditionRulePrevalues(selectedField, rule, $scope.model.fields);
        }

        function deleteConditionRule (rules, rule) {
            formService.deleteConditionRule(rules, rule);
        }

        function addConditionRule(condition) {
            formService.addEmptyConditionRule(condition);
            // set default operator
            var lastIndex = condition.rules.length - 1;
            condition.rules[lastIndex].operator = vm.operators[0].value;
        }

        function getPrevalues(field) {
            formService.loadFieldTypePrevalues(field);
        }

        activate();

    }

    angular.module("umbraco").controller("UmbracoForms.Overlays.FieldSettingsOverlay", FieldSettingsOverlay);

})();

(function() {
    "use strict";

    function FieldTypePickerOverlayController($scope, formResource, formService) {

        var vm = this;

        vm.fieldTypes = [];
        vm.searchTerm = "";

        vm.pickFieldType = pickFieldType;
        vm.filterItems = filterItems;
        vm.showDetailsOverlay = showDetailsOverlay;
        vm.hideDetailsOverlay = hideDetailsOverlay;

        function init() {

            // get workflows with settings
            formResource.getAllFieldTypesWithSettings()
                .then(function (response) {
                    vm.fieldTypes = response.data;
                });
        }


        function pickFieldType(selectedFieldType) {
            $scope.model.fieldType = selectedFieldType;
            $scope.model.submit($scope.model);
        }

        function filterItems() {
            // clear item details
            $scope.model.itemDetails = null;
        }

        function showDetailsOverlay(workflowType) {

            var workflowDetails = {};
            workflowDetails.icon = workflowType.icon;
            workflowDetails.title = workflowType.name;
            workflowDetails.description = workflowType.description;

            $scope.model.itemDetails = workflowDetails;

        }

        function hideDetailsOverlay() {
            $scope.model.itemDetails = null;
        }

        init();

    }

    angular.module("umbraco").controller("UmbracoForms.Overlays.FieldTypePickerOverlayController", FieldTypePickerOverlayController);
})();

(function () {
    "use strict";

    function WorkflowSettingsOverlayController($scope, workflowResource) {

        var vm = this;

        vm.workflowTypes = [];
        vm.focusWorkflowName = true;

        if($scope.model.workflowType && $scope.model.workflowType.id) {
            workflowResource.getScaffoldWorkflowType($scope.model.workflowType.id).then(function(response){
               $scope.model.workflow = response.data;
            });
        }

    }

    angular.module("umbraco").controller("UmbracoForms.Overlays.WorkflowSettingsOverlayController", WorkflowSettingsOverlayController);
})();

(function () {
    "use strict";

    function WorkflowsOverviewOverlayController($scope, workflowResource, notificationsService) {

        var vm = this;

        // massive hack to fix submit when pressing enter
        vm.focusOverlay = true;

        vm.openWorkflowsTypesOverlay = openWorkflowsTypesOverlay;
        vm.editWorkflow = editWorkflow;
        vm.removeWorkflow = removeWorkflow;
        vm.editSubmitMessageWorkflow = editSubmitMessageWorkflow;

        vm.workflowsSortableOptions = {
            distance: 10,
            tolerance: "pointer",
            connectWith: ".umb-forms-workflows__sortable-wrapper",
            opacity: 0.7,
            scroll: true,
            cursor: "move",
            zIndex: 6000,
            handle: ".sortable-handle",
            items: ".sortable",
            placeholder: "umb-forms-workflow__workflow-placeholder",
            start: function(e, ui) {
                ui.placeholder.height(ui.item.height());
            },
            stop: function(event, ui) {
                updateSortOrder($scope.model.formWorkflows.onSubmit);
                updateSortOrder($scope.model.formWorkflows.onApprove);
            }
        };

        function updateSortOrder(array) {
            var sortOrder = 0;
            for(var i = 0; i < array.length; i++) {
                var arrayItem = array[i];
                if(arrayItem.isDeleted === false) {
                    arrayItem.sortOrder = sortOrder;
                    sortOrder++;
                }
            }
        }

        function openWorkflowsTypesOverlay(workflowArray) {

            // set overlay settings and open overlay
            vm.workflowsTypesOverlay = {
                view: "/app_plugins/UmbracoForms/Backoffice/Form/overlays/workflows/workflow-types.html",
                title: "Choose workflow",
                fields: $scope.model.fields,
                hideSubmitButton: true,
                show: true,
                submit: function(model) {

                    // set sortOrder
                    workflowArray.push(model.workflow);
                    updateSortOrder(workflowArray);

                    vm.workflowsTypesOverlay.show = false;
                    vm.workflowsTypesOverlay = null;
                }
            };

        }

        function editWorkflow(workflow) {
            vm.workflowSettingsOverlay = {
                view: "/app_plugins/UmbracoForms/Backoffice/Form/overlays/workflows/workflow-settings.html",
                title: workflow.name,
                workflow: workflow,
                fields: $scope.model.fields,
                show: true,
                submit: function(model) {

                    //Validate settings
                    workflowResource.validateWorkflowSettings(model.workflow).then(function(response){
                        if (response.data.length > 0) {
                            angular.forEach(response.data, function (error) {
                                notificationsService.error("Workflow failed to save", error.Message);
                            });
                        } else {
                            vm.workflowSettingsOverlay.show = false;
                            vm.workflowSettingsOverlay = null;
                        }

                    });

                }
            };
        }

        function editSubmitMessageWorkflow() {

            vm.submitMessageWorkflowOverlay = {
                view: "/app_plugins/UmbracoForms/Backoffice/Form/overlays/workflows/submit-message-workflow-settings.html",
                title: "Message on submit",
                messageOnSubmit: $scope.model.messageOnSubmit,
                goToPageOnSubmit: $scope.model.goToPageOnSubmit,
                show: true,
                submit: function(model) {

                    $scope.model.messageOnSubmit = model.messageOnSubmit;
                    $scope.model.goToPageOnSubmit = model.goToPageOnSubmit;

                    vm.submitMessageWorkflowOverlay.show = false;
                    vm.submitMessageWorkflowOverlay = null;

                }
            };

        }

        function removeWorkflow(workflow, event, workflowTypeArray) {
            workflow.isDeleted = true;
            updateSortOrder(workflowTypeArray);
            event.stopPropagation();
        }

    }

    angular.module("umbraco").controller("UmbracoForms.Overlays.WorkflowsOverviewOverlayController", WorkflowsOverviewOverlayController);
})();

(function() {
    "use strict";

    function WorkflowTypesOverlayController($scope, workflowResource, notificationsService) {

        var vm = this;

        vm.workflowTypes = [];
        vm.searchTerm = "";

        vm.pickWorkflowType = pickWorkflowType;
        vm.filterItems = filterItems;
        vm.showDetailsOverlay = showDetailsOverlay;
        vm.hideDetailsOverlay = hideDetailsOverlay;

        function init() {

            // get workflows with settings
            workflowResource.getAllWorkflowTypesWithSettings()
                .then(function(response) {
                    vm.workflowTypes = response.data;
                    setDefaultWorkflowIcon(vm.workflowTypes);
                });

        }

        function setDefaultWorkflowIcon(workflowTypes) {

            for(var i = 0; i < workflowTypes.length; i++) {
                var workflowType = workflowTypes[i];
                if(!workflowType.icon) {
                    workflowType.icon = "icon-mindmap";
                }
            }
        }

        function pickWorkflowType(selectedWorkflowType) {

            // set overlay settings + open overlay
            vm.workflowSettingsOverlay = {
                view: "/app_plugins/UmbracoForms/Backoffice/Form/overlays/workflows/workflow-settings.html",
                title: selectedWorkflowType.name,
                workflow: $scope.model.workflow,
                workflowType: selectedWorkflowType,
                fields: $scope.model.fields,
                show: true,
                submit: function(model) {

                    workflowResource.validateWorkflowSettings(model.workflow).then(function(response){
                        if (response.data.length > 0) {
                            angular.forEach(response.data, function (error) {
                                notificationsService.error("Workflow failed to save", error.Message);
                            });
                        } else {

                            //Need to add the properties to the $scope from this submitted model
                            $scope.model.workflow = model.workflow;

                            // submit overlay and return the model
                            $scope.model.submit($scope.model);

                            // close the overlay
                            vm.workflowSettingsOverlay.show = false;
                            vm.workflowSettingsOverlay = null;

                        }

                    });
                }
            };
        }

        function filterItems() {
            // clear item details
            $scope.model.itemDetails = null;
        }

        function showDetailsOverlay(workflowType) {

            var workflowDetails = {};
            workflowDetails.icon = workflowType.icon;
            workflowDetails.title = workflowType.name;
            workflowDetails.description = workflowType.description;

            $scope.model.itemDetails = workflowDetails;

        }

        function hideDetailsOverlay() {
            $scope.model.itemDetails = null;
        }

        init();

    }

    angular.module("umbraco").controller("UmbracoForms.Overlays.WorkflowTypesOverlayController", WorkflowTypesOverlayController);
})();

/**
 * @ngdoc controller
 * @name UmbracoForms.Editors.Form.FormDesignController
 * @function
 *
 * @description
 * The controller for the Umbraco Forns type editor
 */
(function () {
    "use strict";

    function formDesignController($scope, formResource, userService, securityResource) {

        var vm = this;
        var currentUser = {};

        vm.currentPage = {};
        vm.security = {};

        //Get PreValues for the current form we are editing/designing
        formResource.getPrevalueSources().then(function (resp) {
            vm.prevaluesources = resp.data;

            formResource.getAllFieldTypesWithSettings().then(function (resp) {
                vm.fieldtypes = resp.data;
                vm.ready = true;
            });
        });

        userService.getCurrentUser().then(function (response) {
            currentUser = response;

            //Now we can make a call to form securityResource
            securityResource.getByUserId(currentUser.id).then(function (response) {
                vm.security = response.data;
            });

        });

    }

    angular.module("umbraco").controller("UmbracoForms.Editors.Form.FormDesignController", formDesignController);
})();

angular.module("umbraco").controller("UmbracoForms.Editors.Security.EditController", function ($scope, $routeParams, securityResource, notificationsService, navigationService) {

    //Ensure the current item we are editing is highlighted in the tree
    navigationService.syncTree({ tree: "formsecurity", path: [String($routeParams.id)], forceReload: true });

    securityResource.getByUserId($routeParams.id).then(function (resp) {
        $scope.security = resp.data;
        $scope.loaded = true;
    });

    $scope.save = function () {
        //Add a property to the object to save the Umbraco User ID taken from the routeParam
        $scope.security.userSecurity.user = $routeParams.id;

        securityResource.save($scope.security).then(function (response) {
            $scope.userSecurity = response.data;
            notificationsService.success("User's Form Security saved", "");

            //SecurityForm is the name of the <form name='securitForm'>
            //Set it back to Pristine after we save, so when we browse away we don't get the 'discard changes' notification
            $scope.securityForm.$setPristine();

        }, function (err) {
            notificationsService.error("User's Form Security failed to save", "");
        });

    };

});



angular.module("umbraco")
.controller("UmbracoForms.Editors.PreValueSource.DeleteController",
	function ($scope, preValueSourceResource, navigationService, treeService) {
	    $scope.delete = function (id) {
	        preValueSourceResource.deleteByGuid(id).then(function () {
	          
	            treeService.removeNode($scope.currentNode);
	            navigationService.hideNavigation();

	        });

	    };
	    $scope.cancelDelete = function () {
	        navigationService.hideNavigation();
	    };
	});
angular.module("umbraco").controller("UmbracoForms.Editors.PreValueSource.EditController", function ($scope, $routeParams, preValueSourceResource, editorState, notificationsService, navigationService, userService, securityResource) {

    //On load/init of 'editing' a prevalue source then
    //Let's check & get the current user's form security
    var currentUserId = null;

    userService.getCurrentUser().then(function (response) {
        currentUserId = response.id;

        //Now we can make a call to form securityResource
        securityResource.getByUserId(currentUserId).then(function (response) {
            $scope.security = response.data;

            //Check if we have access to current form OR manage forms has been disabled
            if (!$scope.security.userSecurity.managePreValueSources) {

                //Show error notification
                notificationsService.error("Access Denied", "You do not have access to edit Prevalue sources");

                //Resync tree so that it's removed & hides
                navigationService.syncTree({ tree: "prevaluesource", path: ['-1'], forceReload: true, activate: false }).then(function (response) {

                    //Response object contains node object & activate bool
                    //Can then reload the root node -1 for this tree 'Forms Folder'
                    navigationService.reloadNode(response.node);
                });

                //Don't need to wire anything else up
                return;
            }
        });
    });

    if ($routeParams.create) {
        //we are creating so get an empty data type item
        preValueSourceResource.getScaffold()
		.then(function (response) {
		    $scope.loaded = true;
		    $scope.preValueSource = response.data;

		    preValueSourceResource.getAllPreValueSourceTypesWithSettings()
	        .then(function (resp) {
	            $scope.types = resp.data;
	           
	        });

		    //set a shared state
		    editorState.set($scope.form);
		});
    } else {

        //we are editing so get the content item from the server
        preValueSourceResource.getByGuid($routeParams.id)
        .then(function (response) {
            
            $scope.preValueSource = response.data;

            preValueSourceResource.getAllPreValueSourceTypesWithSettings()
                .then(function (resp) {
                    $scope.types = resp.data;
                    setTypeAndSettings();
                    getPrevalues();
                    $scope.loaded = true;
                });

            //As we are editing an item we can highlight it in the tree
            navigationService.syncTree({ tree: "prevaluesource", path: [String($routeParams.id)], forceReload: false });
           
            //set a shared state
            editorState.set($scope.preValueSource);
        });
    }

    $scope.setType = function () {
        $scope.prevalues = null;
        setTypeAndSettings();
    };

    $scope.save = function () {
       
        
        //set settings
        $scope.preValueSource.settings = {};
        angular.forEach($scope.preValueSource.$type.settings, function (setting) {
            var key = setting.alias;
            var value = setting.value;
            $scope.preValueSource.settings[key] = value;
           
        });

        //validate settings
        preValueSourceResource.validateSettings($scope.preValueSource)
            .then(function (response) {

            $scope.errors = response.data;
           
            if ($scope.errors.length > 0) {
                angular.forEach($scope.errors, function(error) {
                   
                    notificationsService.error("Prevaluesource failed to save", error.Message);
                });
            } else {
                //save
                preValueSourceResource.save($scope.preValueSource)
                .then(function (response) {
           
                    $scope.preValueSource = response.data;
                    //set a shared state
                    editorState.set($scope.preValueSource);
                    setTypeAndSettings();
                    getPrevalues();
                    $scope.preValueSourceForm.$dirty = false;
                    navigationService.syncTree({ tree: "prevaluesource", path: [String($scope.preValueSource.id)], forceReload: true });
                    notificationsService.success("Prevaluesource saved", "");
                }, function (err) {
                    notificationsService.error("Prevaluesource failed to save", "");
                });            
            }

            }, function (err) {
                notificationsService.error("Prevaluesource failed to save", "Please check if your settings are valid");
            });
        };

    var setTypeAndSettings = function() {
        $scope.preValueSource.$type = _.where($scope.types, { id: $scope.preValueSource.fieldPreValueSourceTypeId })[0];

        //set settings
        angular.forEach($scope.preValueSource.settings, function (setting) {
            for (var key in $scope.preValueSource.settings) {
                if ($scope.preValueSource.settings.hasOwnProperty(key)) {
                    if (_.where($scope.preValueSource.$type.settings, { alias: key }).length > 0) {
                        _.where($scope.preValueSource.$type.settings, { alias: key })[0].value = $scope.preValueSource.settings[key];
                    }

                }
            }
        });
    };

    var getPrevalues = function() {
        
        preValueSourceResource.getPreValues($scope.preValueSource)
            .then(function (response) {
            $scope.prevalues = response.data;
        });
    };

	});
angular.module("umbraco").controller("UmbracoForms.FormPickerController", function ($scope, $http, formResource) {

    //Used to minipulate the Form Object we get back into the simpler form object needed here
    function massageFormDataObject(form) {

        var fields = [];
        var fieldSummary = '';

        //Not sure how to get these fields without this ugly nested loop?
        //For each page in the object
        for (var pageIndex = 0; pageIndex < form.pages.length; pageIndex++) {

            //For each page it will have one or more fieldsets nested
            for (var fieldsetIndex = 0; fieldsetIndex < form.pages[pageIndex].fieldSets.length; fieldsetIndex++)
            {

                //for each fieldset it will have a container
                for (var containerIndex = 0; containerIndex < form.pages[pageIndex].fieldSets[fieldsetIndex].containers.length; containerIndex++)
                {

                    //For each container will have one or more fields
                    for (var fieldIndex = 0; fieldIndex < form.pages[pageIndex].fieldSets[fieldsetIndex].containers[containerIndex].fields.length; fieldIndex++)
                    {
                        var field = form.pages[pageIndex].fieldSets[fieldsetIndex].containers[containerIndex].fields[fieldIndex];

                        //Push the field we find into our new array of just fields only
                        fields.push(field);
                    }
                }
            }
        }

        //Build up field summary
        //Example: Name, Age, Location, Left column and one additional fields
        //Example: Name, Age Location and Left column

        var currentFieldItem = null;

        //Check that we have 4 fields or less
        if (fields.length <= 4) {

            //Loop over first 4 items in fields array
            for (var i = 0; i < fields.length; i++) {

                //Get the current field object in the loop out of array
                currentFieldItem = fields[i];

                //Set the string fieldSummary with the name of the field aka caption
                //If we are not the last item in the array prefix with a comma
                //Otherwise it's an 'and
                if (i !== fields.length - 1) {
                    fieldSummary += currentFieldItem.caption;

                    if (i !== fields.length - 2) {
                        fieldSummary += ', ';
                    }

                }
                else {
                    fieldSummary += ' and ' + currentFieldItem.caption;
                }
            }
        }
        else {
            //Loop over first four items & then append a count of the remaining fields we have
            for (var x = 0; x < 4; x++) {

                //Get the current field object in the loop out of array
                currentFieldItem = fields[x];

                //Set the string fieldSummary with the name of the field aka caption
                fieldSummary += currentFieldItem.caption;

                //If we are NOT the last item use a comma
                //Otherwise it's a comma
                if (x !== fields.length - 1) {
                    fieldSummary += ', ';
                }
            }

            //
            //More than 4 records use - Name, Age, Location, Left column and one additional fiels
            //TODO: Need to use word numbers :'(
            var countExtraFields = fields.length - 4;
            fieldSummary += 'and ' + countExtraFields + ' additional fields';
        }

        var pages = form.pages.length;
        var summary = pages + ' page form with ' + fields.length + ' fields';

        return {
            id: form.id,
            name: form.name,
            fields: fieldSummary,
            summary: summary,
            workflows: form.workflows.length
        };
    };

    $scope.loading = true;
    var selectedForm = null;

    formResource.getOverView().then(function (response) {
        $scope.forms  = response.data;
        $scope.loading = false;
        
        //Only do this is we have a value saved
        if ($scope.model.value) {

            //Try & find picked form from 'model.value' that we save as a 
            //simple GUID out of the collection in forms with _underscore
            selectedForm = _.where(response.data, { id: $scope.model.value });

            if (selectedForm.length === 1) {
                //Found the form from the API (means we currently have access to it)
                $scope.pickedFormName = selectedForm[0].name;
            } else {
                //We have a GUID in model.value saved but it did not come back from the overview API response
                //So this means we do not have access to it, but need to show the form name in the UI

                //Go fetch that specific form by the GUID we have saved
                formResource.getByGuid($scope.model.value).then(function (response) {

                    var form = response.data;

                    //Add the form to the collection of forms - change to same format as API response
                    //Push the item into the array/collection of forms so it can still be selected as a radio button option
                    var formToPush = massageFormDataObject(form);
                    $scope.forms.push(formToPush);
                });
            }
        }

    },
    function (err) {
        $scope.error = "An Error has occured while loading!";
        $scope.loading = false;
    });

    $scope.clear = function () {
        $scope.model.value = null;
    }
});

function dataSourceResource($http) {

    var apiRoot = "backoffice/UmbracoForms/DataSource/";

    return {

        getScaffold: function (template) {
            return $http.get(apiRoot + "GetScaffold");
        },

        getByGuid: function (id) {
            return $http.get(apiRoot + "GetByGuid?guid=" + id);
        },
        deleteByGuid: function (id) {
            return $http.delete(apiRoot + "DeleteByGuid?guid=" + id);
        },
        save: function (preValueSource) {
            return $http.post(apiRoot + "PostSave", preValueSource);
        },

        validateSettings: function (preValueSource) {
            return $http.post(apiRoot + "ValidateSettings", preValueSource);
        },

        getAllDataSourceTypesWithSettings: function () {
            return $http.get(apiRoot + "GetAllDataSourceTypesWithSettings");
        }
    };
}

angular.module('umbraco.resources').factory('dataSourceResource', dataSourceResource);
function dataSourceWizardResource($http) {

    var apiRoot = "backoffice/UmbracoForms/DataSourceWizard/";

    return {

        getScaffold: function (id) {
            return $http.get(apiRoot + "GetScaffold?guid=" + id);
        },

        getAllFieldTypes: function () {
            return $http.get(apiRoot + "GetAllFieldTypes");
        },

        createForm: function (wizard) {
            return $http.post(apiRoot + "CreateForm", wizard);
        }
    };
}

angular.module('umbraco.resources').factory('dataSourceWizardResource', dataSourceWizardResource);
/**
    * @ngdoc service
    * @name umbraco.resources.dashboardResource
    * @description Handles loading the dashboard manifest
    **/
function exportResource($http) {
    //the factory object returned
    var apiRoot = "backoffice/UmbracoForms/Export/";

    return {

        getExportTypes: function (formId) {
            return $http.get(apiRoot + "GetExportTypes?formId=" + formId);
        },

        generateExport: function (config) {
            return $http.post(apiRoot + "PostGenerateExport", config);
        },

        getExportUrl: function (formId, fileName) {
            return apiRoot + "GetExport?formId=" + formId + "&fileName=" + fileName;
        },

        getExport: function (token) {
            return $http.get(apiRoot + "GetExport?token=" + token);
        }

    };
}

angular.module('umbraco.resources').factory('exportResource', exportResource);

/**
    * @ngdoc service
    * @name umbraco.resources.dashboardResource
    * @description Handles loading the dashboard manifest
    **/
function formResource($http) {
    //the factory object returned
    var apiRoot = "backoffice/UmbracoForms/Form/";

    return {

        getScaffold: function (template) {
            return $http.get(apiRoot + "GetScaffold?template=" + template);
        },
        
        getScaffoldWithWorkflows: function (template) {
            return $http.get(apiRoot + "GetScaffoldWithWorkflows?template=" + template);
        },

        getAllTemplates: function () {
            return $http.get(apiRoot + "GetFormTemplates");
        },

        getOverView : function(){
                return $http.get(apiRoot + 'GetOverView');
        },

        getByGuid: function (id) {
            return $http.get(apiRoot + "GetByGuid?guid=" + id);
        },
        
        getWithWorkflowsByGuid: function (id) {
            return $http.get(apiRoot + "GetWithWorkflowsByGuid?guid=" + id);
        },

        deleteByGuid: function (id) {
            return $http.delete(apiRoot + "DeleteByGuid?guid=" + id);
        },

        save: function (form) {
            return $http.post(apiRoot + "PostSave", form);
        },
        
        saveWithWorkflows: function (formWithWorkflows) {
            return $http.post(apiRoot + "SaveForm", formWithWorkflows);
        },
        
        getAllFieldTypes: function() {
            return $http.get(apiRoot + "GetAllFieldTypes");
        },

        getAllFieldTypesWithSettings: function () {
            return $http.get(apiRoot + "GetAllFieldTypesWithSettings");
        },
        getPrevalueSources: function() {
            return $http.get(apiRoot + "GetPrevalueSources");
        },

        copy: function(id, newFormName) {
            return $http.post(apiRoot + "CopyForm", { guid: id, newName: newFormName });
        }
    };
}

angular.module('umbraco.resources').factory('formResource', formResource);

/**
    * @ngdoc service
    * @name umbraco.resources.dashboardResource
    * @description Handles loading the dashboard manifest
    **/
function licensingResource($http) {
    //the factory object returned
    var apiRoot = "backoffice/UmbracoForms/Licensing/";

    return {

        getLicenseStatus: function () {
            return $http.get(apiRoot + "GetLicenseStatus");
        },

        getAvailableLicenses: function (config) {
            return $http.post(apiRoot + "PostRetriveAvailableLicenses", config);
        },

        configureLicense: function (config) {
            return $http.post(apiRoot + "PostConfigureLicense", config);
        }

    };
}

angular.module('umbraco.resources').factory('licensingResource', licensingResource);

function pickerResource($http) {

    var apiRoot = "backoffice/UmbracoForms/Picker/";

    return {
        getAllConnectionStrings: function () {
            return $http.get(apiRoot + "GetAllConnectionStrings");
        },
        getAllDataTypes: function () {
            return $http.get(apiRoot + "GetAllDataTypes");
        },
        getAllDocumentTypes: function () {
            return $http.get(apiRoot + "GetAllDocumentTypes");
        },
        getAllDocumentTypesWithAlias: function () {
            return $http.get(apiRoot + "GetAllDocumentTypesWithAlias");
        },
        getAllMediaTypes: function () {
            return $http.get(apiRoot + "GetAllMediaTypes");
        },
        getAllFields: function (formGuid) {
            return $http.get(apiRoot + "GetAllFields?formGuid="+formGuid);
        },
        getAllProperties: function (doctypeAlias) {
            return $http.get(apiRoot + "GetAllProperties?doctypeAlias=" + doctypeAlias);
        }

    };
}

angular.module('umbraco.resources').factory('pickerResource', pickerResource);
function preValueSourceResource($http) {

    var apiRoot = "backoffice/UmbracoForms/PreValueSource/";

    return {

        getScaffold: function (template) {
            return $http.get(apiRoot + "GetScaffold");
        },

        getByGuid: function (id) {
            return $http.get(apiRoot + "GetByGuid?guid=" + id);
        },
        deleteByGuid: function (id) {
            return $http.delete(apiRoot + "DeleteByGuid?guid=" + id);
        },
        save: function (preValueSource) {
            return $http.post(apiRoot + "PostSave", preValueSource);
        },

        validateSettings: function (preValueSource) {
            return $http.post(apiRoot + "ValidateSettings", preValueSource);
        },

        getPreValues: function (preValueSource) {
            return $http.post(apiRoot + "GetPreValues", preValueSource);
        },

        getPreValuesByGuid: function (preValueSourceId) {
            return $http.get(apiRoot + "GetPreValuesByGuid?preValueSourceId=" + preValueSourceId);
        },

        getAllPreValueSourceTypesWithSettings: function () {
            return $http.get(apiRoot + "GetAllPreValueSourceTypesWithSettings");
        }
    };
}

angular.module('umbraco.resources').factory('preValueSourceResource', preValueSourceResource);
/**
    * @ngdoc service
    * @name umbraco.resources.dashboardResource
    * @description Handles loading the dashboard manifest
    **/
function recordResource($http) {
    //the factory object returned
    var apiRoot = "backoffice/UmbracoForms/Record/";

    return {

        getRecords: function (filter) {
            return $http.post(apiRoot + "PostRetriveRecords", filter);
        },

        getRecordsCount: function (filter) {
            return $http.post(apiRoot + "PostRetriveRecordsCount", filter);
        },

        getRecordActions: function () {
            return $http.get(apiRoot + "GetRecordActions");
        },

        getRecordSetActions: function () {
            return $http.get(apiRoot + "GetRecordSetActions");
        },

        executeRecordSetAction : function(model){
            return $http.post(apiRoot + "PostExecuteRecordSetAction", model);
        }

    };
}

angular.module('umbraco.resources').factory('recordResource', recordResource);

function securityResource($http) {

    var apiRoot = "backoffice/UmbracoForms/FormSecurity/";

    return {
        getByUserId: function (userId) {
            return $http.get(apiRoot + "GetByUserId?userId=" + userId);
        },
        save: function (userSecurity) {
            return $http.post(apiRoot + "PostSave", userSecurity);
        }
    };
}

angular.module('umbraco.resources').factory('securityResource', securityResource);
/**
    * @ngdoc service
    * @name umbraco.resources.dashboardResource
    * @description Handles loading the dashboard manifest
    **/
function updatesResource($http) {
    //the factory object returned
    var apiRoot = "backoffice/UmbracoForms/Updates/";

    return {
        getUpdateStatus: function () {
            return $http.get(apiRoot + "GetUpdateStatus");
        },

        installLatest: function (version) {
            return $http.get(apiRoot + "InstallLatest?version=" + version);
        },

        getVersion: function() {
            return $http.get(apiRoot + "GetVersion");
        }
    };
}

angular.module('umbraco.resources').factory('updatesResource', updatesResource);

function workflowResource($http) {

    var apiRoot = "backoffice/UmbracoForms/Workflow/";

    return {

        getScaffold: function (template) {
            return $http.get(apiRoot + "GetScaffold");
        },

        getByGuid: function (id) {
            return $http.get(apiRoot + "GetByGuid?guid=" + id);
        },
        deleteByGuid: function (id) {
            return $http.delete(apiRoot + "DeleteByGuid?guid=" + id);
        },
        save: function (preValueSource) {
            return $http.post(apiRoot + "PostSave", preValueSource);
        },

        validateSettings: function (preValueSource) {
            return $http.post(apiRoot + "ValidateSettings", preValueSource);
        },

        getAllWorkflowTypesWithSettings: function () {
            return $http.get(apiRoot + "GetAllWorkflowTypesWithSettings");
        },
        getAllWorkflows: function (formGuid) {
            return $http.get(apiRoot + "GetAllWorkflows?formGuid=" + formGuid);
        },
        updateSortOrder: function (state, workflowIds) {
            var data = {};
            data.state = state;
            data.guids = workflowIds;

            return $http.post(apiRoot + "UpdateSortOrder", data);
        },
        
        getScaffoldWorkflowType: function(workflowTypeId){
            return $http.get(apiRoot + "GetScaffoldWorkflowType?workflowTypeId="+ workflowTypeId);
        },
        
        validateWorkflowSettings: function(workflowViewModel){
            return $http.post(apiRoot + "ValidateWorkflowSettings", workflowViewModel);
        }
        
    };
}

angular.module('umbraco.resources').factory('workflowResource', workflowResource);
angular.module("umbraco.directives")
    .directive('umbFormsAutoFocus', function($timeout) {

        return function(scope, element, attr){

            var update = function() {

                //if it uses its default naming
                if(element.val().indexOf(" field") >= 0){
                    element.focus();
                }

            };

            $timeout(function() {
                update();
            });


            scope.$watch(attr.umbFormsFocusOn, function (_focusVal) {
                $timeout(function () {
                    if (_focusVal) {
                        element.focus();
                        element.select();
                        update();
                    }
                });
            });
    };
});

angular.module("umbraco.directives")
    .directive('umbFormsAutoSize', function($timeout) {

        return function(scope, element, attr){
            var domEl = element[0];
            var update = function(force) {

                if(force === true){
                    element.height(0);
                }

                if(domEl.scrollHeight !== domEl.clientHeight){
                    element.height(domEl.scrollHeight);
                }
            };


            element.bind('keyup keydown keypress change', update);
            element.bind('blur', function(){ update(true); });

            $timeout(function() {
                update();
            });
    };
});

angular.module("umbraco.directives")
    .directive('umbFormsContentPicker', function (dialogService, entityResource, iconHelper) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/App_Plugins/UmbracoForms/directives/umb-forms-content-picker.html',
        require: "ngModel",
        link: function (scope, element, attr, ctrl) {

            ctrl.$render = function() {
                var val = parseInt(ctrl.$viewValue);

                if (!isNaN(val) && angular.isNumber(val) && val > 0) {

                    entityResource.getById(val, "Document").then(function(item) {
                        item.icon = iconHelper.convertFromLegacyIcon(item.icon);
                        scope.node = item;
                    });
                }
            };

            scope.openContentPicker = function () {
                scope.contentPickerOverlay = {
                    view: "contentpicker",
                    show: true,
                    submit: function(model) {
                        populate(model.selection[0]);
                        scope.contentPickerOverlay.show = false;
                        scope.contentPickerOverlay = null;
                    }
                };
            };

            scope.clear = function () {
                scope.id = undefined;
                scope.node = undefined;
                updateModel(0);
            };

            function populate(item) {
                scope.clear();
                item.icon = iconHelper.convertFromLegacyIcon(item.icon);
                scope.node = item;
                scope.id = item.id;
                updateModel(item.id);
            }

            function updateModel(id) {
                ctrl.$setViewValue(id);

            }
        }
    };
});

angular.module("umbraco.directives").directive('umbFormsDateRangePicker', function (assetsService, userService) {
    return {
        restrict: 'A',
        scope: {
            userLocale: "@",
            onChange: "="
        },
        template: '<div class="daterange daterange--double"></div>',
        link: function (scope, element) {

            assetsService.load([
                "/App_Plugins/UmbracoForms/Assets/moment/min/moment-with-locales.min.js",
                "/App_Plugins/UmbracoForms/Assets/BaremetricsCalendar/public/js/calendar.js"
            ])
            .then(function () {

                //Set the moment locale to the current user's locale
                //Used for display, we still grab the date as YYYY-MM-DD to send to API endpoint
                moment.locale(scope.userLocale);

                var dd = new Calendar({
                    element: $(".daterange--double"),
                    earliest_date: 'January 1, 2000',
                    latest_date: moment(),
                    start_date: moment().subtract(29, 'days'),
                    end_date: moment(),
                    same_day_range: true,
                    callback: function () {

                        //Date update/changed

                        //Parse the dates from this component to Moment dates
                        var start = moment(this.start_date);
                        var end = moment(this.end_date);
                        var dateFilter = {};

                        dateFilter.startDate = start.format('YYYY-MM-DD');
                        dateFilter.endDate = end.format('YYYY-MM-DD');

                        if(scope.onChange) {
                            scope.onChange(dateFilter);
                        }

                    }
                });

            });

            //Load CSS as dependancy
            //load the seperate css for the editor to avoid it blocking our js loading
            assetsService.loadCss("/App_Plugins/UmbracoForms/Assets/BaremetricsCalendar/public/css/application.css");

        }
    };
});

angular.module("umbraco.directives")
    .directive('ufDelayedMouseleave', function ($timeout, $parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, ctrl) {
                var active = false;
                var fn = $parse(attrs.ufDelayedMouseleave);
                element.on("mouseleave", function(event) {
                    var callback = function() {
                        fn(scope, {$event:event});
                    };

                    active = false;
                    $timeout(function(){
                        if(active === false){
                            scope.$apply(callback);
                        }
                    }, 650);
                });

                element.on("mouseenter", function(event, args){
                    active = true;
                });
            }
        };
    });

angular.module("umbraco.directives")
    .directive('umbFormsDesigner', function (dialogService, formService) {
        return {
            scope: {
                form: "=",
                fieldtypes: "=",
                prevaluesources: "="
            },

            transclude: true,

            restrict: 'E',
            replace: true,

            templateUrl: '/App_Plugins/UmbracoForms/directives/umb-forms-designer.html',
            link: function (scope, element, attrs, ctrl) {


                // *********************************************
                // Form management functions
                // *********************************************
                scope.initForm = function(form, fieldtypes){
                    formService.initForm(form, fieldtypes);
                    scope.gotoPageIndex(0);
                };


                // *********************************************
                // Page management functions
                // *********************************************

                scope.gotoPageIndex = function(index){
                    scope.form.$currentPage = scope.form.pages[index];
                    scope.currentPageIndex = index;

                    scope.onFirstPage = scope.currentPageIndex === 0;
                    scope.onLastPage = scope.currentPageIndex === scope.form.pages.length-1;
                };

                scope.addPage = function (form) {
                    scope.closeItemOverlay();
                    formService.addPage(form);
                    scope.gotoPageIndex(form.pages.length -1);

                };

                scope.deletePage = function (page) {
                    var index = scope.form.pages.indexOf(page);
                    scope.form.pages.splice(index, 1);
                    if (index > 0) {
                        scope.currentPageIndex = index - 1;
                        scope.form.$currentPage = scope.form.pages[index - 1];
                    } else {
                        scope.currentPageIndex = 0;
                        scope.form.$currentPage = scope.form.pages[0];
                    }

                    scope.onFirstPage = scope.currentPageIndex === 0;
                    scope.onLastPage = scope.currentPageIndex === scope.form.pages.length - 1;

                    populateFields();
                };

                // *********************************************
                // Fieldset management functions
                // *********************************************

                scope.setCurrentFieldset = function (fieldset) {
                    scope.currentFieldset = fieldset;
                };

                scope.addFieldset = function(page, fieldset, container, index){
                    scope.closeItemOverlay();
                    var _index = page.fieldSets.indexOf(fieldset);
                    formService.addFieldset(page, _index+1);
                };

                scope.deleteFieldset = function(page,fieldset) {
                    formService.deleteFieldset(page, fieldset);
                };

                scope.editFieldset = function (fieldset) {
                    populateFields();
                    dialogService.open(
                    {
                        template: "/app_plugins/UmbracoForms/Backoffice/Form/dialogs/fieldsetsettings.html",
                        fieldset: fieldset,
                        fields: scope.fields
                    });
                };

                // *********************************************
                // Container management functions
                // *********************************************
                scope.addContainer = function (fieldset, container, index) {
                    scope.closeItemOverlay();
                    var _index = fieldset.containers.indexOf(container);
                    formService.splitContainer(fieldset, container, _index+1);
                };

                // *********************************************
                // Field management functions
                // *********************************************
                scope.initField = function(field){
                    if(field && !field.$fieldType){
                        formService.setFieldType(field,field.fieldTypeId);
                    }
                };

                scope.addField = function (container, fieldtype, index) {
                    scope.closeItemOverlay();
                    formService.addField(container, fieldtype, index+1);
                };

                scope.editField = function(field){
                    populateFields();

                    scope.setFieldType(field);

                    dialogService.open(
                            {
                                template: "/app_plugins/UmbracoForms/Backoffice/Form/dialogs/fieldsettings.html",
                                field: field,
                                fields: scope.fields,
                                setFieldType: formService.setFieldType,
                                fieldtypes: scope.fieldtypes,
                                prevaluesources: scope.prevaluesources
                            });
                };

                scope.deleteField = function(fieldset,container,field) {
                    formService.deleteField(fieldset,container,field);
                };

                scope.copyField = function (container, field) {
                    var copy ={};
                    angular.copy(field, copy);
                    copy.id = generateGUID();
                    copy.caption = "copy of " + copy.caption;
                    container.fields.splice(container.fields.indexOf(field) + 1, 0, copy);
                    populateFields();
                };

                scope.setFieldType = function (field) {

                    //set settings
                    angular.forEach(field.settings, function (setting) {
                        for (var key in field.settings) {
                            if (field.settings.hasOwnProperty(key)) {
                                if (_.where(field.$fieldType.settings, { alias: key }).length > 0) {
                                    _.where(field.$fieldType.settings, { alias: key })[0].value = field.settings[key];
                                }
                            }
                        }
                    });

                };


                // *********************************************
                // Button/hover state handlers
                // *********************************************
                scope.setCurrentControl = function (field) {
                    scope.currentControl = field;
                };

                scope.setCurrentToolsControl = function (field) {
                    scope.currentToolsControl = field;
                };

                scope.setCurrentRemoveControl = function (Control) {
                    scope.currentRemoveControl = Control;
                };

                scope.setCurrentMoveControl = function (Control) {
                    scope.currentMoveControl = Control;
                };

                scope.setCurrentContainer = function (container) {
                    scope.currentContainer = container;
                };





                // *********************************************
                // Field conditions
                // *********************************************
                scope.addConditionRule = function (condition) {
                    if (!condition.rules){
                        condition.rules = [];
                    }

                    condition.rules.push({
                        field: condition.$newrule.field,
                        operator: condition.$newrule.operator,
                        value: condition.$newrule.value
                    });

                    condition.$newrule.field = null;
                    condition.$newrule.operator = null;
                    condition.$newrule.value = null;
                };

                scope.deleteFieldConditionRule = function (rules, rule) {
                    var index = rules.indexOf(rule);
                    rules.splice(index, 1);
                };


                // *********************************************
                // Sorting configurations
                // *********************************************
                scope.fieldSetSortableOptions = {
                        distance: 10,
                        cursor: "move",
                        placeholder: 'ui-sortable-placeholder',
                        handle: '.cell-tools-move',
                        connectWith: ".umb-forms-fieldsets"
                };

                scope.fieldSortableOptions = {
                    distance: 10,
                    cursor: "move",
                    placeholder: 'ui-sortable-placeholder',
                    handle: '.cell-tools-move',
                    connectWith: ".umb-forms-fields-container"
                };

                // *********************************************
                // Add items overlay menu
                // *********************************************
                scope.overlayMenu = {
                    show: false,
                    style: {},
                    container: undefined,
                    fieldset: undefined
                };

                scope.addItemOverlay = function(sender, field, fieldset, container, index){
                    scope.overlayMenu.container = container;
                    scope.overlayMenu.fieldset = fieldset;
                    scope.overlayMenu.index = index;
                    scope.overlayMenu.style = {};
                    scope.overlayMenu.field = field;

                    //todo calculate position...
                    var offset = $(sender.target).offset();
                    var height = $(window).height();
                    var width = $(window).width();

                    if((height-offset.top) < 250){
                        scope.overlayMenu.style.bottom = 0;
                        scope.overlayMenu.style.top = "initial";
                    }else if(offset.top < 300){
                        scope.overlayMenu.style.top = 190;
                    }

                    scope.overlayMenu.show = true;
                };

                scope.closeItemOverlay = function(){
                    scope.overlayMenu.show = false;
                    scope.overlayMenu.field = undefined;
                };


                scope.adjustSize = function(ev){
                    if(ev.target.scrollHeight > ev.target.clientHeight){
                        $(ev.target).height(ev.target.scrollHeight);
                    }
                };


                // *********************************************
                // Button functons
                // *********************************************

                scope.editForm = function (form, section) {
                    dialogService.closeAll();
                    dialogService.open(
                        {
                            template: "/app_plugins/UmbracoForms/Backoffice/Form/dialogs/formsettings.html",
                            form: form,
                            section: section,
                            page: scope.currentPage
                        });
                };

                // *********************************************
                // Internal functons
                // *********************************************
                var populateFields = function() {
                    scope.fields = [];
                    angular.forEach(scope.form.pages, function(page) {
                        angular.forEach(page.fieldSets, function(fieldset) {
                            angular.forEach(fieldset.containers, function(container) {
                                angular.forEach(container.fields, function (field) {
                                    scope.fields.push(field);
                                });
                            });
                        });
                    });
                };

                scope.initForm(scope.form, scope.fieldtypes);
            }
        };
    });

angular.module("umbraco.directives")
    .directive('umbFormsDesignerNew', function (dialogService, formService, workflowResource, notificationsService) {
        return {
            scope: {
                form: "=",
                fieldtypes: "=",
                prevaluesources: "=",
                security: "="
            },
            transclude: true,
            restrict: 'E',
            replace: true,
            templateUrl: '/App_Plugins/UmbracoForms/directives/umb-forms-designer-new.html',
            link: function (scope, element, attrs, ctrl) {


                scope.sortingMode = false;
                scope.sortingButtonKey = "general_reorder";


                // *********************************************
                // Sorting management functions
                // *********************************************

                scope.sortablePages = {
                    distance: 10,
                    tolerance: "pointer",
                    opacity: 0.7,
                    scroll: true,
                    cursor: "move",
                    placeholder: "umb-forms__page-placeholder",
                    zIndex: 6000,
                    handle: ".sortable-handle",
                    items: ".sortable",
                    start: function(e, ui) {
                        ui.placeholder.height(ui.item.height());
                    }
                };

                scope.sortableFieldsets = {
                    distance: 10,
                    tolerance: "pointer",
                    connectWith: ".umb-forms__fieldsets",
                    opacity: 0.7,
                    scroll: true,
                    cursor: "move",
                    placeholder: "umb-forms__fieldset-placeholder",
                    zIndex: 6000,
                    handle: ".sortable-handle",
                    items: ".sortable",
                    start: function(e, ui) {
                        ui.placeholder.height(ui.item.height());
                    },
                    over: function(e, ui) {
                        scope.$apply(function () {
                            $(e.target).scope().page.dropOnEmpty = true;
                        });
                    },
                    out: function(e, ui) {
                        scope.$apply(function () {
                            $(e.target).scope().page.dropOnEmpty = false;
                        });
                    }
                };

                scope.sortableFields = {
                    distance: 10,
                    tolerance: "pointer",
                    connectWith: ".umb-forms__fields",
                    opacity: 0.7,
                    scroll: true,
                    cursor: "move",
                    placeholder: "umb-forms__field-placeholder",
                    zIndex: 6000,
                    handle: ".sortable-handle",
                    items: ".sortable",
                    start: function(e, ui) {
                        ui.placeholder.height(ui.item.height());
                    },
                    over: function(e, ui) {
                        scope.$apply(function () {
                            $(e.target).scope().container.dropOnEmpty = true;
                        });
                    },
                    out: function(e, ui) {
                        scope.$apply(function () {
                            $(e.target).scope().container.dropOnEmpty = false;
                        });
                    }
                };

                scope.toggleSortingMode = function() {
                    scope.sortingMode = !scope.sortingMode;

                    if(scope.sortingMode) {
                        scope.sortingButtonKey = "general_reorderDone";
                    } else {
                        scope.sortingButtonKey = "general_reorder";
                    }

                };

                // *********************************************
                // Form management functions
                // *********************************************
                scope.initForm = function(form, fieldtypes){
                    formService.initForm(form, fieldtypes);
                };


                // *********************************************
                // Delete promt
                // *********************************************
                 scope.togglePrompt = function(object) {
                     object.deletePrompt = !object.deletePrompt;
                 };

                 scope.hidePrompt = function(object) {
                     object.deletePrompt = false;
                 };

                // *********************************************
                // Page management functions
                // *********************************************

                scope.addPage = function (form) {
                    formService.addPage(form);
                };

                scope.removePage = function(pages, index) {
                    pages.splice(index, 1);
                };

                scope.formHasFields = function(form) {
                    var hasFields = false;

                    angular.forEach(scope.form.pages, function(page) {
                        angular.forEach(page.fieldSets, function(fieldset) {
                            angular.forEach(fieldset.containers, function(container) {
                                if(container.fields.length > 0) {
                                    hasFields = true;
                                }
                            });
                        });
                    });

                    return hasFields;
                };

                scope.pageHasFields = function(page) {

                    var hasFields = false;

                    angular.forEach(page.fieldSets, function(fieldset) {
                        angular.forEach(fieldset.containers, function(container) {
                            if(container.fields.length > 0) {
                                hasFields = true;
                            }
                        });
                    });

                    return hasFields;

                };

                // *********************************************
                // Fieldset management functions
                // *********************************************


                scope.addFieldset = function(page){
                    // always add it last
                    var _index = page.fieldSets.length;
                    formService.addFieldset(page, _index);
                };

                scope.removeFieldset = function(page, fieldset) {
                    formService.deleteFieldset(page, fieldset);
                };

                scope.editFieldset = function (fieldset) {
                    populateFields();

                    scope.fieldsetSettingsOverlay = {
                        view: "/app_plugins/UmbracoForms/Backoffice/Form/overlays/fieldsetsettings/fieldset-settings.html",
                        title: "Edit group",
                        fieldset: fieldset,
                        fields: scope.fields,
                        closeButtonLabel: "Cancel",
                        show: true,
                        submit: function(model) {
                            scope.fieldsetSettingsOverlay.show = false;
                            scope.fieldsetSettingsOverlay = null;
                        },
                        close: function(oldModel) {
                            fieldset.containers = oldModel.fieldset.containers;
                            fieldset.condition = oldModel.fieldset.condition;

                            scope.fieldsetSettingsOverlay.show = false;
                            scope.fieldsetSettingsOverlay = null;
                        }
                    };
                };


                // *********************************************
                // Field management functions
                // *********************************************

                scope.addField = function(fieldset, container) {

                    populateFields();

                    var emptyField = formService.addEmptyField(container);

                    scope.fieldSettingsOverlay = {
                        view: "/app_plugins/UmbracoForms/Backoffice/Form/overlays/fieldsettings/field-settings.html",
                        title: "Add question",
                        field: emptyField,
                        fields: scope.fields,
                        prevalueSources: scope.prevaluesources,
                        show: true,
                        submit: function(model) {

                            emptyField.settings = {};

                            for (var i = 0; i < model.field.$fieldType.settings.length; i++) {
                                var setting = model.field.$fieldType.settings[i];
                                var key = setting.alias;
                                var value = setting.value;
                                emptyField.settings[key] = value;
                            }

                            scope.fieldSettingsOverlay.show = false;
                            scope.fieldSettingsOverlay = null;
                        },
                        close: function(oldModel) {
                            formService.deleteField(fieldset, container, emptyField);
                            scope.fieldSettingsOverlay.show = false;
                            scope.fieldSettingsOverlay = null;
                        }
                    };

                };

                scope.openFieldSettings = function(field){

                    populateFields();

                    scope.setFieldType(field);

                    scope.fieldSettingsOverlay = {
                        view: "/app_plugins/UmbracoForms/Backoffice/Form/overlays/fieldsettings/field-settings.html",
                        title: "Edit question",
                        field: field,
                        fields: scope.fields,
                        prevalueSources: scope.prevaluesources,
                        show: true,
                        submit: function(model) {

                            field.settings = {};

                            for (var i = 0; i < model.field.$fieldType.settings.length; i++) {
                                var setting = model.field.$fieldType.settings[i];
                                var key = setting.alias;
                                var value = setting.value;
                                field.settings[key] = value;
                            }

                            scope.fieldSettingsOverlay.show = false;
                            scope.fieldSettingsOverlay = null;
                        }
                    };
                };

                scope.removeField = function(fieldset,container,field) {
                    formService.deleteField(fieldset,container,field);
                };

                scope.setFieldType = function (field) {

                    //set settings
                    angular.forEach(field.settings, function (setting) {
                        for (var key in field.settings) {
                            if (field.settings.hasOwnProperty(key)) {
                                if (_.where(field.$fieldType.settings, { alias: key }).length > 0) {
                                    _.where(field.$fieldType.settings, { alias: key })[0].value = field.settings[key];
                                }
                            }
                        }
                    });

                };

                // *********************************************
                // Field conditions
                // *********************************************

                scope.getFieldNameFromGuid = function(selectedFieldId) {
                    populateFields();
                    for(var i = 0; i < scope.fields.length; i++) {
                        var field = scope.fields[i];
                        if(field.id === selectedFieldId) {
                            return field.caption;
                        }
                    }
                };

                // *********************************************
                // Button functons
                // *********************************************

                scope.editWorkflows = function() {

                    if(scope.security && scope.security.userSecurity.manageWorkflows) {

                        populateFields();

                        scope.workflowsOverlay = {
                            view: "/app_plugins/UmbracoForms/Backoffice/Form/overlays/workflows/workflows-overview.html",
                            title: "Workflows",
                            formWorkflows: scope.form.formWorkflows,
                            messageOnSubmit: scope.form.messageOnSubmit,
                            goToPageOnSubmit: scope.form.goToPageOnSubmit,
                            submitLabel: scope.form.submitLabel,
                            manualApproval: scope.form.manualApproval,
                            fields: scope.fields,
                            closeButtonLabel: "Cancel",
                            show: true,
                            submit: function(model) {
                                scope.form.formWorkflows = model.formWorkflows;
                                scope.form.messageOnSubmit = model.messageOnSubmit;
                                scope.form.goToPageOnSubmit = model.goToPageOnSubmit;

                                scope.workflowsOverlay.show = false;
                                scope.workflowsOverlay = null;
                            },
                            close: function(oldModel) {
                                // reset the model
                                scope.form.formWorkflows = oldModel.formWorkflows;
                                scope.form.messageOnSubmit = oldModel.messageOnSubmit;
                                scope.form.goToPageOnSubmit = oldModel.goToPageOnSubmit;

                                scope.workflowsOverlay.show = false;
                                scope.workflowsOverlay = null;
                            }
                        };

                    }
                };

                scope.editWorkflowSettings = function(workflow) {

                    if(scope.security && scope.security.userSecurity.manageWorkflows) {

                        populateFields();

                        scope.workflowSettingsOverlay = {
                            view: "/app_plugins/UmbracoForms/Backoffice/Form/overlays/workflows/workflow-settings.html",
                            workflow: workflow,
                            fields: scope.fields,
                            title: workflow.name,
                            show: true,
                            submit: function(model) {

                                //Validate settings
                                workflowResource.validateWorkflowSettings(model.workflow).then(function(response){
                                    if (response.data.length > 0) {
                                        angular.forEach(response.data, function (error) {
                                            notificationsService.error("Workflow failed to save", error.Message);
                                        });
                                    } else {
                                        scope.workflowSettingsOverlay.show = false;
                                        scope.workflowSettingsOverlay = null;
                                    }

                                });
                            }
                        };

                    }

                };

                scope.editSubmitMessageWorkflow = function() {

                    scope.submitMessageWorkflowOverlay = {
                        view: "/app_plugins/UmbracoForms/Backoffice/Form/overlays/workflows/submit-message-workflow-settings.html",
                        title: "Message on submit",
                        messageOnSubmit: scope.form.messageOnSubmit,
                        goToPageOnSubmit: scope.form.goToPageOnSubmit,
                        show: true,
                        submit: function(model) {
                            scope.form.messageOnSubmit = model.messageOnSubmit;
                            scope.form.goToPageOnSubmit = model.goToPageOnSubmit;

                            scope.submitMessageWorkflowOverlay.show = false;
                            scope.submitMessageWorkflowOverlay = null;
                        }
                    };

                };

                // *********************************************
                // Internal functons
                // *********************************************
                var populateFields = function() {
                    scope.fields = [];
                    angular.forEach(scope.form.pages, function(page) {
                        angular.forEach(page.fieldSets, function(fieldset) {
                            angular.forEach(fieldset.containers, function(container) {
                                angular.forEach(container.fields, function (field) {
                                    scope.fields.push(field);
                                });
                            });
                        });
                    });
                };

                scope.initForm(scope.form, scope.fieldtypes);
            }
        };
    });

(function () {
    'use strict';

    function FormsEntryDetail() {

        function link(scope, el, attr, ctrl) {


            //console.log("from directive", scope.entry);

        }

        var directive = {
            restrict: 'E',
            replace: true,
            templateUrl: '/App_Plugins/UmbracoForms/directives/umb-forms-entry-detail.html',
            scope: {
                entry: '='
            },
            link: link
        };

        return directive;
    }

    angular.module('umbraco.directives').directive('umbFormsEntryDetail', FormsEntryDetail);

})();

angular.module("umbraco.directives")
    .directive('umbFormsInlinePrevalueEditor', function (notificationsService) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/App_Plugins/UmbracoForms/directives/umb-forms-inline-prevalue-editor.html',
            require: "ngModel",
            link: function (scope, element, attr, ctrl) {
                scope.prevalues = [];

                ctrl.$render = function () {
                    if (Object.prototype.toString.call(ctrl.$viewValue) === '[object Array]') {
                        scope.prevalues = ctrl.$viewValue;
                    }
                };

                function updateModel() {
                    ctrl.$setViewValue(scope.prevalues);
                }

                function addPrevalue() {

                    //Check that our array does not already contain the same item
                    if (scope.prevalues.indexOf(scope.newPrevalue) < 0) {
                        scope.prevalues.push(scope.newPrevalue);
                        scope.newPrevalue = '';
                        updateModel();
                    } else {
                        //Notify user they are trying to add a prevalue that already exists
                        notificationsService.error("PreValue Error", "Unable to add PreValue as this is a duplicate");
                    }
                }

                scope.addPrevalue = function () {
                    addPrevalue();
                };

            }
        };
    });
angular.module("umbraco.directives")
    .directive('umbFormsLegacyContentPicker', function (dialogService, entityResource, iconHelper) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/App_Plugins/UmbracoForms/directives/umb-forms-legacy-content-picker.html',
        require: "ngModel",
        link: function (scope, element, attr, ctrl) {

            ctrl.$render = function() {
                var val = parseInt(ctrl.$viewValue);

                if (!isNaN(val) && angular.isNumber(val) && val > 0) {

                    entityResource.getById(val, "Document").then(function(item) {
                        item.icon = iconHelper.convertFromLegacyIcon(item.icon);
                        scope.node = item;
                    });
                }
            };

            scope.openContentPicker = function () {
                var d = dialogService.treePicker({
                    section: "content",
                    treeAlias: "content",
                    multiPicker: false,
                    callback: populate
                });
            };

            scope.clear = function () {
                scope.id = undefined;
                scope.node = undefined;
                updateModel(0);
            };

            function populate(item) {
                scope.clear();
                item.icon = iconHelper.convertFromLegacyIcon(item.icon);
                scope.node = item;
                scope.id = item.id;
                updateModel(item.id);
            }

            function updateModel(id) {
                ctrl.$setViewValue(id);
                
            }
        }
    };
});

angular.module("umbraco.directives")
    .directive('umbFormsOverlay', function () {
        return {
            restrict: 'A',
            link: function (scope, el, attrs, ctrl) {
                var margin = 50,
                winHeight = $(window).height(),
                
                calculate = _.throttle(function(){
                    if(el){
                        //detect bottom fold
                        var bottom_dif = (el.offset().top + el.height() + margin) - winHeight;
                        if(bottom_dif > 0){

                            $(el).css('margin-top', function (index, curValue) {
                                return parseInt(curValue, 10) - bottom_dif + 'px';
                            });
                        }else{
                            //else detect top fold           
                        }
                    }
                }, 1000);

                //On resize, make sure to check the overlay
                $(window).bind("resize", function () {
                   winHeight = $(window).height();
                   calculate();
                });
            }
        };
    });
angular.module("umbraco.directives")
    .directive('umbFormsPrevalueEditor', function (notificationsService) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/App_Plugins/UmbracoForms/directives/umb-forms-prevalue-editor.html',
            require: "ngModel",
            link: function (scope, element, attr, ctrl) {

                scope.prevalues = [];


                ctrl.$render = function () {
                    if (Object.prototype.toString.call(ctrl.$viewValue) === '[object Array]') {
                        scope.prevalues = ctrl.$viewValue;
                    }
                };

                function updateModel() {
                    ctrl.$setViewValue(scope.prevalues);
                }

                scope.deletePrevalue = function (idx) {
                    scope.prevalues.splice(idx, 1);
                    updateModel();
                };

                scope.addPrevalue = function () {
                    
                    //Check that our array does not already contain the same item
                    if (scope.prevalues.indexOf(scope.newPrevalue) < 0) {
                        scope.prevalues.push(scope.newPrevalue);
                        scope.newPrevalue = '';
                        updateModel();
                    } else {
                        //Notify user they are trying to add a prevalue that already exists
                        notificationsService.error("PreValue Error", "Unable to add PreValue as this is a duplicate");
                    }
                };

            }
        };
    });
(function () {
    'use strict';

    function FormsRenderType() {

        var directive = {
            restrict: 'E',
            replace: true,
            templateUrl: '/App_Plugins/UmbracoForms/directives/umb-forms-render-type.html',
            scope: {
                view: "=",
                field: '='
            }
        };

        return directive;
    }

    angular.module('umbraco.directives').directive('umbFormsRenderType', FormsRenderType);

})();

function formService(preValueSourceResource) {

	var generateGUID = function() {
	    var d = new Date().getTime();

	    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	        var r = (d + Math.random() * 16) % 16 | 0;
	        d = Math.floor(d / 16);
	        return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
	    });

	    return uuid;
	};


	var service = {
		fieldTypes: [],
		actionTypes: [
			{
				name: "show",
				value: "Show"
			},
			{
				name: "hide",
				value: "Hide"
			}
		],
		logicTypes: [
			{
				name: "all",
				value: "All"
			},
			{
				name: "any",
				value: "Any"
			}
		],
		operators: [
			{
				name: "is",
				value: "Is"
			},
			{
				name: "is not",
				value: "IsNot"
			},
			{
				name: "is greater than",
				value: "GreaterThen"
			},
			{
				name: "is less than",
				value: "LessThen"
			},
			{
				name: "contains",
				value: "Contains"
			},
			{
				name: "starts with",
				value: "StartsWith"
			},
			{
				name: "ends with",
				value: "EndsWith"
			}
		],

		getActionTypes: function() {
			return service.actionTypes;
		},

		getLogicTypes: function() {
			return service.logicTypes;
		},

		getOperators: function() {
			return service.operators;
		},

		initForm: function(form, fieldtypes){
			service.fieldTypes = fieldtypes;

			if(!form.pages || form.pages.length === 0){
			    service.addPage(form);
			}else{

				_.each(service.getAllFields(form), function(field){

					if(!field.$fieldType){
						service.setFieldType(field,field.fieldTypeId);
					}

				});
			}
		},

		addPage: function(form, index){
			var p = {caption: "", fieldSets: []};
			service.addFieldset(p);

			if(form.pages.length > index){
				form.pages.splice(index, 0, p);
			}else{
				form.pages.push(p);
			}
		},

		addFieldset: function(page, index){
			var fs = {caption: "", containers: [], id:generateGUID()};
			service.addContainer(fs);

			if(page.fieldSets.length > index){
				page.fieldSets.splice(index, 0, fs);
			}else{
				page.fieldSets.push(fs);
			}
		},

		deleteFieldset : function(page, fieldset){
			if(page.fieldSets.length > 1){
				var index = page.fieldSets.indexOf(fieldset);
				page.fieldSets.splice(index, 1);
			}else{
				fieldset.containers.length = 0;
				service.addContainer(fieldset);
			}
		},

		deleteFieldsetAtIndex : function(page, index){
			if(page.fieldSets.length > 1){
				page.fieldSets.splice(index, 1);
			}else{
				fieldset.containers.length = 0;
				service.addContainer(fieldset);
			}
		},

		splitFieldset: function(page, fieldset, container, splitAtIndex){

			var newfieldset = {caption: "", containers: [{ caption: "", fields: [] }] };
			var insertAt = page.fieldSets.indexOf(fieldset);

			page.fieldSets.splice(insertAt+1, 0, newfieldset);

			var oldFields = container.fields.slice(0,splitAtIndex+1);
			var newFields = container.fields.slice(splitAtIndex+1);

			newfieldset.containers[0].fields = newFields;
			container.fields = oldFields;
		},

		addContainer: function(fieldset, index){
			var c = { caption: "", fields: [] };

			if(fieldset.containers.length > index){
				fieldset.containers.splice(index, 0, c);
			}else{
				fieldset.containers.push(c);
			}
		},

		splitContainer: function(fieldset, container, splitAtIndex){

			var newContainer = { caption: "", fields: [] };
			var insertAt = fieldset.containers.indexOf(container);

			fieldset.containers.splice(insertAt-1, 0, newContainer);
			var newFields = container.fields.slice(0,splitAtIndex+1);
			var oldFields = container.fields.slice(splitAtIndex+1);

			newContainer.fields = newFields;
			container.fields = oldFields;
		},

		deleteContainer: function(fieldset, container){
			//only delete the container if there are multiple ones on this fieldseet
			//otherwise keep it and just clear its contents
			if(fieldset.containers.length > 1){
				var index = fieldset.containers.indexOf(container);
				if(index >= 0){
					service.deleteContainerAtIndex(fieldset, index);
				}
			}else{
				container.fields.length = 0;
			}
		},

		deleteContainerAtIndex: function(fieldset, index){

			if(fieldset.containers.length > 1){
				fieldset.containers.splice(index, 1);
			}else{
				fieldset.containers.length = 0;
			}
		},


		syncContainerWidths : function(form){
			_.each(form.pages, function(page){
				_.each(page.fieldSets, function(fieldset){
					var containers = fieldset.containers.length;
					var avrg = Math.floor(12 / containers);
					_.each(fieldset.containers, function(container){
						container.width = avrg;
					});
				});
			});
		},

		addField : function(container, fieldtype, index) {
		    var newField = {
		        caption: "",
		        id: generateGUID(),
		        settings: {},
		        preValues: [],
		        $focus: true
			};

			service.loadFieldTypeSettings(newField, fieldtype);

			if(container.fields.length > index){
				container.fields.splice(index, 0, newField);
			}else{
				container.fields.push(newField);
			}

		},

		addEmptyField : function(container) {

			var newField = {
				caption: "",
				id: generateGUID(),
				settings: {},
				preValues: [],
				$focus: true
			};

			container.fields.push(newField);

			return newField;

		},

		getAllFields : function(form){
			var fields = [];
			if(form.pages){
				_.each(form.pages, function(page){
					if(page.fieldSets){
						_.each(page.fieldSets, function(fieldset){
							if(fieldset.containers){
								_.each(fieldset.containers, function(container){
									if(container.fields){
										_.each(container.fields, function(field){
											fields.push(field);
										});
									}
								});
							}
						});
					}
				});
			}

			return fields;
		},


		deleteField: function(fieldset,container,field){
			var index = container.fields.indexOf(field);
			if(index >= 0){
				service.deleteFieldAtIndex(fieldset, container, index);
			}
		},


		deleteFieldAtIndex: function(fieldset,container,index){

			container.fields.splice(index, 1);

			if(container.fields.length === 0){
				service.deleteContainer(fieldset,container);
			}

		},


		setFieldType: function(field, fieldTypeId){
			//get field type
			field.fieldTypeId = fieldTypeId;

			var fldt = _.find(service.fieldTypes, function(ft){return ft.id === field.fieldTypeId; });
			field.$fieldType = fldt;

			service.loadFieldTypeSettings(field, field.$fieldType);


			service.loadFieldTypePrevalues(field);

		},

        loadFieldTypePrevalues : function(field) {

            if (field.prevalueSourceId !== null && field.prevalueSourceId !== "00000000-0000-0000-0000-000000000000") {

                preValueSourceResource.getPreValuesByGuid(field.prevalueSourceId)
                    .then(function(response) {
                        field.$preValues = response.data;

                    });
            } else {
                field.$preValues = null;
            }

        },

		loadFieldTypeSettings : function(field, fieldtype){

			var stng = angular.copy(fieldtype.settings);

			if(field.fieldTypeId !== fieldtype.id){
				field.settings = {};
			}

			field.fieldTypeId = fieldtype.id;
			field.$fieldType = fieldtype;

			if(fieldtype.settings){
				_.each(fieldtype.settings, function(setting){
					if(!field.settings[setting.alias]){
						field.settings[setting.alias] = "";
					}
				});
			}
		},


		deleteConditionRule : function(rules, rule) {
		    var index = rules.indexOf(rule);
		    rules.splice(index, 1);
		},

        addConditionRule : function(condition) {
	        if (!condition.rules) {
	            condition.rules = [];
	        }

	        condition.rules.push({
	            field: condition.$newrule.field,
	            operator: condition.$newrule.operator,
	            value: condition.$newrule.value
	        });
        },

		addEmptyConditionRule : function(condition) {
			if (!condition.rules) {
	            condition.rules = [];
	        }

			condition.rules.push({
				field: "",
				operator: "",
				value: ""
			});
		},

		populateConditionRulePrevalues: function(selectedField, rule, fields) {

			for(var i = 0; i < fields.length; i++) {
				var field = fields[i];

				if(field.id === selectedField) {

					// prevalues and be stored in both $preValues and preValues
					if(field.$preValues && field.$preValues.length > 0) {

						rule.$preValues = field.$preValues;

					} else if(field.preValues && field.preValues.length > 0) {

						var rulePreValuesObjectArray = [];

						// make prevalues to object array
						for(var preValueIndex = 0; preValueIndex < field.preValues.length; preValueIndex++) {

							var preValue = field.preValues[preValueIndex];
							var preValueObject = {
								value: preValue
							};

							rulePreValuesObjectArray.push(preValueObject);
						}

						rule.$preValues = rulePreValuesObjectArray;

					} else {
						rule.$preValues = null;
					}

				}
			}

		}

	};

	return service;
}
angular.module('umbraco.services').factory('formService', formService);

/**
 * Compares two software version numbers (e.g. "1.7.1" or "1.2b").
 *
 *
 * @param {string} v1 The first version to be compared.
 * @param {string} v2 The second version to be compared.
 * @param {object} [options] Optional flags that affect comparison behavior:
 * <ul>
 *     <li>
 *         <tt>lexicographical: true</tt> compares each part of the version strings lexicographically instead of
 *         naturally; this allows suffixes such as "b" or "dev" but will cause "1.10" to be considered smaller than
 *         "1.2".
 *     </li>
 *     <li>
 *         <tt>zeroExtend: true</tt> changes the result if one version string has less parts than the other. In
 *         this case the shorter string will be padded with "zero" parts instead of being considered smaller.
 *     </li>
 * </ul>
 * @returns {number|NaN}
 * <ul>
 *    <li>0 if the versions are equal</li>
 *    <li>a negative integer iff v1 < v2</li>
 *    <li>a positive integer iff v1 > v2</li>
 *    <li>NaN if either version string is in the wrong format</li>
 * </ul>
 */

(function() {
    'use strict';

    function utilityService() {

        function compareVersions(v1, v2, options) {

            var lexicographical = options && options.lexicographical,
                zeroExtend = options && options.zeroExtend,
                v1parts = v1.split('.'),
                v2parts = v2.split('.');

            function isValidPart(x) {
                return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
            }

            if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
                return NaN;
            }

            if (zeroExtend) {
                while (v1parts.length < v2parts.length) {
                    v1parts.push("0");
                }
                while (v2parts.length < v1parts.length) {
                    v2parts.push("0");
                }
            }

            if (!lexicographical) {
                v1parts = v1parts.map(Number);
                v2parts = v2parts.map(Number);
            }

            for (var i = 0; i < v1parts.length; ++i) {
                if (v2parts.length === i) {
                    return 1;
                }

                if (v1parts[i] === v2parts[i]) {
                    continue;
                } else if (v1parts[i] > v2parts[i]) {
                    return 1;
                } else {
                    return -1;
                }
            }

            if (v1parts.length !== v2parts.length) {
                return -1;
            }

            return 0;
        }

        var service = {

            compareVersions: compareVersions

        };

        return service;

    }


    angular.module('umbraco.services').factory('utilityService', utilityService);


})();

angular.module('umbraco.filters').filter('truncate', function() {
    
    return function(input, noOfChars, appendDots) {
        
        //Check the length of the text we are filtering
        //If its greater than noOfChars param
        if(input.length > noOfChars){
            //Trim the text to the length of the param
            input = input.substr(0, noOfChars);
            
            //Only append the dots if we truncated
            //Append Dots is a bool
            if(appendDots){
                input = input + "...";
            }
        }
        
        return input;
    };
  
})
.filter('fileName', function() {
    
    return function(input) {
        
       // The input will be a path like so, we just want my-panda-photo.jpg
       // /media/forms/upload/f2ab8761-6a75-4c9d-a281-92e5e508856a/my-panda-photo.jpg
        
        input = input.split('\\').pop().split('/').pop();
        
        return input;
    };
  
});
(function () {
  "use strict";
  'use strict';

  // HathiTrust Add-On - START
  // HathiTrust Add-On - START
  // HathiTrust Add-On - START
  angular.module('hathiTrustAvailability', []).constant('hathiTrustBaseUrl', 'https://catalog.hathitrust.org/api/volumes/brief/json/').config(['$sceDelegateProvider', 'hathiTrustBaseUrl', function ($sceDelegateProvider, hathiTrustBaseUrl) {
    var urlWhitelist = $sceDelegateProvider.resourceUrlWhitelist();
    urlWhitelist.push(hathiTrustBaseUrl + '**');
    $sceDelegateProvider.resourceUrlWhitelist(urlWhitelist);
  }]).factory('hathiTrust', ['$http', '$q', 'hathiTrustBaseUrl', function ($http, $q, hathiTrustBaseUrl) {
    var svc = {};

    var lookup = function lookup(ids) {
      if (ids.length) {
        var hathiTrustLookupUrl = hathiTrustBaseUrl + ids.join('|');
        return $http.jsonp(hathiTrustLookupUrl, {
          cache: true,
          jsonpCallbackParam: 'callback'
        }).then(function (resp) {
        return resp.data;
        });
      } else {
        return $q.resolve(null);
      }
    };

    // find a HT record URL for a given list of identifiers (regardless of copyright status)
    svc.findRecord = function (ids) {
      return lookup(ids).then(function (bibData) {
        for (var i = 0; i < ids.length; i++) {
          var recordId = Object.keys(bibData[ids[i]].records)[0];
          if (recordId) {
            return $q.resolve(bibData[ids[i]].records[recordId].recordURL);
          }
        }
        return $q.resolve(null);
      }).catch(function (e) {
        console.error(e);
      });
    };

    // find a public-domain HT record URL for a given list of identifiers
    svc.findFullViewRecord = function (ids) {
      var handleResponse = function handleResponse(bibData) {
        var fullTextUrl = null;
        for (var i = 0; !fullTextUrl && i < ids.length; i++) {
          var result = bibData[ids[i]];
          for (var j = 0; j < result.items.length; j++) {
            var item = result.items[j];
            if (item.usRightsString.toLowerCase() === 'full view') {
              fullTextUrl = result.records[item.fromRecord].recordURL;
              fullTextUrl = fullTextUrl + '_PD';
              break;
            }
          }
        }
        return $q.resolve(fullTextUrl);
      };
      return lookup(ids).then(handleResponse).catch(function (e) {
        console.error(e);
      });
    };

    return svc;
  }]).controller('hathiTrustAvailabilityController', ['hathiTrust','$scope', '$location', '$mdDialog', '$anchorScroll', function (hathiTrust, $scope, $location, $mdDialog, $anchorScroll) {
    var self = this;

    self.$onInit = function () {
      if (!self.msg) self.msg = 'Full Text Available at HathiTrust';

      // prevent appearance/request iff 'hide-online'
      if (self.hideOnline && isOnline()) {
        return;
      }

      // prevent appearance/request iff 'hide-if-journal'
      if (self.hideIfJournal && isJournal()) {
        return;
      }

      // look for full text at HathiTrust
      updateHathiTrustAvailability();
    };

    var isJournal = function isJournal() {
      var format = self.prmSearchResultAvailabilityLine.result.pnx.addata.format[0];
      return !(format.toLowerCase().indexOf('journal') == -1); // format.includes("Journal")
    };

    var isOnline = function isOnline() {
      var delivery = self.prmSearchResultAvailabilityLine.result.delivery || [];
      if (!delivery.GetIt1) return delivery.deliveryCategory.indexOf('Alma-E') !== -1;
      return self.prmSearchResultAvailabilityLine.result.delivery.GetIt1.some(function (g) {
        return g.links.some(function (l) {
          return l.isLinktoOnline;
        });
      });
    };

    var formatLink = function formatLink(link) {
      if ( link.match(/_PD$/i) ){
        link = link.substring(0, link.length - 3);
        self.fullTextLinkMsg = 'Available online with HathiTrust - Public Domain Access';
      } else {
        self.fullTextLinkMsg = 'Error - ' + link;
      }
      return link;
    };

    var isOclcNum = function isOclcNum(value) {
      return value.match(/^(\(ocolc\))+\d+$/i);
    };

    var updateHathiTrustAvailability = function updateHathiTrustAvailability() {
      var hathiTrustIds = (self.prmSearchResultAvailabilityLine.result.pnx.addata.oclcid || []).filter(isOclcNum).map(function (id) {
        return 'oclc:' + id.toLowerCase().replace('(ocolc)', '');
      });
      hathiTrust[self.ignoreCopyright ? 'findRecord' : 'findFullViewRecord'](hathiTrustIds).then(function (res) {
        if (res) self.fullTextLink = formatLink(res);
      });
    };
  }]).component('hathiTrustAvailability', {
    require: {
      prmSearchResultAvailabilityLine: '^prmSearchResultAvailabilityLine'
    },
    bindings: {
      entityId: '@',
      ignoreCopyright: '<',
      hideIfJournal: '<',
      hideOnline: '<',
      msg: '@?'
    },
    controller: 'hathiTrustAvailabilityController',
    template: '<span ng-if="$ctrl.fullTextLink" class="umnHathiTrustLink">\
        <md-icon alt="HathiTrust Logo">\
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 16 16" enable-background="new 0 0 16 16" xml:space="preserve">  <image id="image0" width="16" height="16" x="0" y="0"\
                      xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAALGPC/xhBQAAACBjSFJN\
                      AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACNFBMVEXuegXvegTsewTveArw\
                      eQjuegftegfweQXsegXweQbtegnsegvxeQbvegbuegbvegbveQbtegfuegbvegXveQbvegbsfAzt\
                      plfnsmfpq1/wplPuegXvqFrrq1znr2Ptok/sewvueQfuegbtegbrgRfxyJPlsXDmlTznnk/rn03q\
                      pVnomkjnlkDnsGnvwobsfhPveQXteQrutHDqpF3qnUnpjS/prmDweQXsewjvrWHsjy7pnkvqqGDv\
                      t3PregvqhB3uuXjusmzpp13qlz3pfxTskC3uegjsjyvogBfpmkHpqF/us2rttXLrgRjrgBjttXDo\
                      gx/vtGznjzPtfhHqjCfuewfrjCnwfxLpjC7wtnDogBvssmjpfhLtegjtnEjrtnTmjC/utGrsew7s\
                      o0zpghnohB/roUrrfRHtsmnlkTbrvH3tnEXtegXvegTveQfqhyHvuXjrrGTpewrsrmXqfRHogRjt\
                      q2Dqewvqql/wu3vqhyDueQnwegXuegfweQPtegntnUvnt3fvxI7tfhTrfA/vzJvmtXLunEbtegrw\
                      egTregzskjbsxI/ouoPsqFzniyrz2K3vyZnokDLpewvtnkv30J/w17XsvYXjgBbohR7nplnso1L0\
                      1Kf40Z/um0LvegXngBnsy5juyJXvsGftrGTnhB/opVHoew7qhB7rzJnnmErkkz3splbqlT3smT3t\
                      tXPqqV7pjzHvunjrfQ7vewPsfA7uoU3uqlruoEzsfQ/vegf///9WgM4fAAAAFHRSTlOLi4uLi4uL\
                      i4uLi4uLi4tRUVFRUYI6/KEAAAABYktHRLvUtndMAAAAB3RJTUUH4AkNDgYNB5/9vwAAAQpJREFU\
                      GNNjYGBkYmZhZWNn5ODk4ubh5WMQERUTl5CUEpWWkZWTV1BUYlBWUVVT19BUUtbS1tHV0zdgMDQy\
                      NjE1MzRXsrC0sraxtWOwd3B0cnZxlXZz9/D08vbxZfDzDwgMCg4JdQsLj4iMio5hiI2LT0hMSk5J\
                      TUvPyMzKzmHIzcsvKCwqLiktK6+orKquYZCuratvaGxqbmlta+8QNRBl6JQ26Oru6e3rnzBx0uQ8\
                      aVGGvJopU6dNn1E8c9bsOXPniYoySM+PXbBw0eIlS5fl1C+PFRFlEBUVXbFy1eo1a9fliQDZYIHY\
                      9fEbNm7avEUUJiC6ddv2HTt3mSuBBfhBQEBQSEgYzOIHAHtfTe/vX0uvAAAAJXRFWHRkYXRlOmNy\
                      ZWF0ZQAyMDE2LTA5LTEzVDE0OjA2OjEzLTA1OjAwNMgVqAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAx\
                      Ni0wOS0xM1QxNDowNjoxMy0wNTowMEWVrRQAAAAASUVORK5CYII=" />\
                      </svg> \
        </md-icon>\
        <a target="_blank" ng-href="{{$ctrl.fullTextLink}}">\
            {{ ::$ctrl.fullTextLinkMsg }}\
            <prm-icon external-link="" icon-type="svg" svg-icon-set="primo-ui" icon-definition="open-in-new"></prm-icon>\
        </a>\
    </span>'
  });
  // HathiTrust Add-On - END
  // HathiTrust Add-On - END
  // HathiTrust Add-On - END

  // Google Tag Manager - START
  // Google Tag Manager - START
  // Google Tag Manager - START
  /* 
  * Begin Google Tag Manager code
  * Adapted from: https://github.com/csudhlib/primo-explore-google-analytics
  */
  angular.module('googleTagManager', []);
  angular.module('googleTagManager').run(function ($rootScope, $interval, tagOptions) {
    if (tagOptions.hasOwnProperty("enabled") && tagOptions.enabled) {
      if (tagOptions.hasOwnProperty("siteId") && tagOptions.siteId != '') {
        if (typeof gtag === 'undefined') {
          var _gtag = function _gtag() {
            dataLayer.push(arguments);
          };
    
          var s = document.createElement('script');
          s.src = 'https://www.googletagmanager.com/gtag/js?id=' + tagOptions.siteId;
          document.body.appendChild(s);
          window.dataLayer = window.dataLayer || [];
    
          _gtag('js', new Date());
    
          _gtag('config', tagOptions.siteId, {
            'allow_ad_personalization_signals': false,
            'allow_google_signals': false,
            'alwaysSendReferrer': true,
            'anonymizeIp': true
          });
        }
      }
      $rootScope.$on('$locationChangeSuccess', function (event, toState, fromState) {
        if (tagOptions.hasOwnProperty("defaultTitle")) {
          var documentTitle = tagOptions.defaultTitle;
          var interval = $interval(function () {
            if (document.title !== '') documentTitle = document.title;
            if (window.location.pathname.indexOf('openurl') !== -1 || window.location.pathname.indexOf('fulldisplay') !== -1) if (angular.element(document.  querySelector('prm-full-view-service-container .item-title>a')).length === 0) return;else documentTitle = angular.element(document.querySelector  ('prm-full-view-service-container .item-title>a')).text();
    
            if (typeof gtag !== 'undefined') {
              if (fromState != toState) {
                gtag('event', 'page_view', {
                  'referrer': fromState,
                  'location': toState,
                  'title': documentTitle
                });
              } else {
                gtag('event', 'page_view', {
                  'location': toState,
                  'title': documentTitle
                });
              }
            }
            $interval.cancel(interval);
          }, 0);
        }
      });
    }
  });
  angular.module('googleTagManager').value('tagOptions', {
    enabled: true,
    siteId: 'gtm_secret_33579127',
    defaultTitle: 'Library Search'
  });
  /* End Google Tag Manager integration */
  // Google Tag Manager - END
  // Google Tag Manager - END
  // Google Tag Manager - END

  var app = angular.module('viewCustom', ['angularLoad', 'googleTagManager', 'externalSearch', 'hathiTrustAvailability']);
  var LOCAL_VID = "01UCS_LAL";


  // External Search - START
  // External Search - START
  // External Search - START
  /** externalSearch **/
  app.component('prmFacetExactAfter', {
    bindings: { parentCtrl: '<' },
    template: '<external-search></external-search>',
    controller: ['$scope', '$location', 'searchTargets', function($scope, $location, searchTargets) {
      this.$onInit = function(){
        {
          $scope.name = this.parentCtrl.facetGroup.name;
          $scope.targets = searchTargets;
          var query = $location.search().query;
          var filter = $location.search().pfilter;
          $scope.queries = Array.isArray(query) ? query : query ? [query] : false;
          $scope.filters = Array.isArray(filter) ? filter : filter ? [filter] : false;

          /*
           * From https://github.com/alliance-pcsg/primo-explore-external-search
           * Customized to replace "University of California" with "UC" in facets and to alphabetize the list.
           */
          if ($scope.name == 'institution') {
               // Once the institutions facets load, find them in the document.
               var institutionFacets = document.querySelector('[data-facet-group="institution"]');
               // Facets are created and destroyed in the DOM when the group is toggled so watch for clicks
               institutionFacets.addEventListener('click', function () {
                    // There is a slight delay as Alma loads the facets, so check on a tight interval
                    var i = 0;
                    var institutionsInterval = window.setInterval(function () {
                         var institutions = institutionFacets.getElementsByClassName('text-number-space');
                         // When found, cycle through the institutions and replace the text as appropriate
                         if (institutions.length > 0) {
                              var _iteratorNormalCompletion = true;
                              var _didIteratorError = false;
                              var _iteratorError = undefined;

                             try {
                                for (var _iterator = institutions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                     var oneInst = _step.value;
 
                                     oneInst.textContent = oneInst.textContent.replace(',', '');
                                     oneInst.textContent = oneInst.textContent.replace('University of California', 'UC');
                                     oneInst.title = oneInst.title.replace(',', '');
                                     oneInst.title = oneInst.title.replace('University of California', 'UC');
                                     clearInterval(institutionsInterval);
                                }
                                // Now alphabetize! First, get the better query for doing this.
                           } catch (err) {
                                _didIteratorError = true;
                                _iteratorError = err;
                           } finally {
                                try {
                                     if (!_iteratorNormalCompletion && _iterator.return) {
                                          _iterator.return();
                                     }
                                } finally {
                                     if (_didIteratorError) {
                                          throw _iteratorError;
                                     }
                                }
                           }

                              var elems = institutionFacets.getElementsByClassName('md-chip');
                              console.log("Elems: ", elems);
                              // turn into a sortable array
                              elems = Array.prototype.slice.call(elems);
                              // Sort it.
                              elems.sort(function (a, b) {
                                   return a.textContent.localeCompare(b.textContent);
                              });
                              // Reattached the sorted elements
                              for (var i = 0; i < elems.length; i++) {
                                   var parent = elems[i].parentNode;
                                   var detatchedItem = parent.removeChild(elems[i]);
                                   parent.appendChild(detatchedItem);
                              }
                         }
                         // Only try 10 times before exiting.
                         i > 10 ? clearInterval(institutionsInterval) : i++;
                    }, 100);
               });
          }
          /*
           * END - From https://github.com/alliance-pcsg/primo-explore-external-search
           * END - Customized to replace "University of California" with "UC" in facets and to alphabetize the list.
           */
        }
      };
    }]
  });

  angular.module('externalSearch', []).value('searchTargets', []).directive('externalSearch', function () {
    return {
      require: '^^prmFacet',
      restrict: 'E',
      template: `
      <div ng-if="name === 'External Search'">
        <div ng-hide="$ctrl.parentCtrl.facetGroup.facetGroupCollapsed">
          <div class="section-content animate-max-height-variable" id="external-search">
            <div ng-repeat="target in targets" aria-live="polite" class="md-chip animate-opacity-and-scale facet-element-marker-local4">
              <div class="md-chip-content layout-row" role="button" tabindex="0">
                <strong dir="auto" title="{{ target.name }}">
                  <a ng-href="{{ target.url + target.mapping(queries, filters) }}" target="_blank">
                    <img ng-src="{{ target.img }}" width="40" height="40"/> {{ target.name }}
                  </a>
                  <span class="desc">{{target.desc}}</span>
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>`,
      controller: ['$scope', '$location', 'searchTargets', function ($scope, $location, searchTargets) {
        $scope.name = $scope.$ctrl.parentCtrl.facetGroup.name;
        $scope.targets = searchTargets;
        var query = $location.search().query;
        var filter = $location.search().pfilter;
        $scope.queries = Array.isArray(query) ? query : query ? [query] : false;
        $scope.filters = Array.isArray(filter) ? filter : filter ? [filter] : false;
      }],
      link: function link(scope, element, attrs, prmFacetCtrl) {
        var facetTitle = 'External Search';
        var found = false;
        for (var facet in prmFacetCtrl.facets) {
          if (prmFacetCtrl.facets[facet].name === facetTitle) {
            found = true;
          }
        }
        if (!found) {
          prmFacetCtrl.facets.push({
            name: facetTitle,
            displayedType: 'exact',
            limitCount: 0,
            facetGroupCollapsed: true,
            values: []
          });
        }
      }
    };
  });

  // auto select Test or Prod
  var uclaHostName = "/discovery/custom/01UCS_LAL-UCLA";
  var uclaHostNameTemp = "custom/01UCS_LAL-UCLA/html/prmSearchBarAfter.html";
  if (window.location.href.indexOf("01UCS_LAL:Test_00") > -1) {
    uclaHostName = "/discovery/custom/01UCS_LAL-Test_00";
    uclaHostNameTemp = "custom/01UCS_LAL-Test_00/html/prmSearchBarAfterTest.html";
  }
  app.value('searchTargets', [{
    "name": "Google Scholar",
    "url": "https://scholar.google.com/scholar?q=",
    "img": uclaHostName + "/img/logo-googlescholar.png",
    "img_2": uclaHostName + "/img/logo-googlescholar.png",
    "alt": "Google Scholar",
    mapping: function mapping(queries, filters) {
      try {
        return queries.map(function (part) {
          return part.split(",")[2] || "";
        }).join(' ');
      } catch (e) {
        return '';
      }
    }
  }, {
    "name": "PubMed",
    "url": "https://pubmed.ncbi.nlm.nih.gov/?otool=uclalib&term=",
    "img": uclaHostName + "/img/logo-pubmed.png",
    "img_2": uclaHostName + "/img/logo_placeholder.png",
    "alt": "PubMed",
    mapping: function mapping(queries, filters) {
      try {
        return queries.map(function (part) {
          return part.split(",")[2] || "";
        }).join(' ');
      } catch (e) {
        return '';
      }
    }
  }, {
    "name": "WorldCat",
    "url": "http://www.worldcat.org/search?q=",
    "img": uclaHostName + "/img/logo-worldcat.png",
    "img_2": uclaHostName + "/img/logo_placeholder.png",
    "alt": "WorldCat",
    mapping: function mapping(queries, filters) {
      try {
        return queries.map(function (part) {
          return part.split(",")[2] || "";
        }).join(' ');
      } catch (e) {
        return '';
      }
    }
  },{
    "name": "Search in Worldcat Basic",
    "desc": "for advanced filtering options",
    "url": "https://ucla.on.worldcat.org/v2/search?queryString=",
    "img": uclaHostName + "/img/logo-worldcatbasic.png",
    "img_2": uclaHostName + "/img/logo_placeholder.png",
    "alt": "Search in Worldcat Basic",
    mapping: function (queries, filters) {
      try {
        return queries.map(function (part) {
          return part.split(",")[2] || "";
        }).join(' ');
      } catch (e) {
        return '';
      }
    }

  }]);
  // /** END externalSearch **/
  // External Search - END
  // External Search - END
  // External Search - END


  // Search Logo - START
  // Search Logo - START
  // Search Logo - START
  /* UC Library Search Logo */
  app.component('prmSearchBarAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'SearchBarAfterController',
    templateUrl: uclaHostNameTemp
  });

  app.controller('SearchBarAfterController', ['$scope', '$rootScope', '$location', '$window', function($scope, $rootScope, $location, $window) {
    var vm = this;

    this.$onInit = function(){
      {
        this.navigateToHomePage = function () {
          var params = $location.search();
          console.log(params);
          var vid = params.vid;
          var lang = params.lang || "en_US";
          var split = $location.absUrl().split('/discovery/');

          if (split.length === 1) {
            console.log(split[0] + ' : Could not detect the view name!');
            return false;
          }

          if ($location.absUrl().match('mode=advanced')) {
            console.log($location.absUrl().match('mode=advanced') + ' : Detected Advanced Search!');
            return false;
          }

          var baseUrl = split[0];
          $window.location.href = baseUrl + '/discovery/search?vid=' + vid + '&lang=' + lang;
          return true;
        };

        this.showSearchLogo = function() {
          var params = $location.search();
          console.log(params);
          var vid = params.vid;
          var lang = params.lang || "en_US";
          var split = $location.absUrl().split('/discovery/');

          if (split.length === 1) {
            console.log(split[0] + ' : Could not detect the view name!');
            return false;
          }

          if ($location.absUrl().match('mode=advanced')) {
            console.log($location.absUrl().match('mode=advanced') + ' : Detected Advanced Search!');
            return false;
          }

          return true;
        };
      }
    };
  }]);
  // Search Logo - END
  // Search Logo - END
  // Search Logo - END


  // BrowZine - START
  // BrowZine - START
  // BrowZine - START
  // Begin BrowZine - Primo Integration...
  window.browzine = {
    api: "https://public-api.thirdiron.com/public/v1/libraries/33",
    apiKey: "browzine_secret_78895369",
    journalCoverImagesEnabled: true,
    journalBrowZineWebLinkTextEnabled: true,
    journalBrowZineWebLinkText: "View Journal Contents",

    articleBrowZineWebLinkTextEnabled: true,
    articleBrowZineWebLinkText: "View Issue Contents",

    articlePDFDownloadLinkEnabled: true,
    articlePDFDownloadLinkText: "Download PDF",

    articleLinkEnabled: true,
    articleLinkText: "Read Article",

    printRecordsIntegrationEnabled: true,

    unpaywallEmailAddressKey: "saclaudi@uci.edu",

    articlePDFDownloadViaUnpaywallEnabled: true,
    articlePDFDownloadViaUnpaywallText: "Download PDF (via Unpaywall)",

    articleLinkViaUnpaywallEnabled: true,
    articleLinkViaUnpaywallText: "Read Article (via Unpaywall)",

    articleAcceptedManuscriptPDFViaUnpaywallEnabled: true,
    articleAcceptedManuscriptPDFViaUnpaywallText: "Download PDF (Accepted Manuscript via Unpaywall)",

    articleAcceptedManuscriptArticleLinkViaUnpaywallEnabled: true,
    articleAcceptedManuscriptArticleLinkViaUnpaywallText: "Read Article (Accepted Manuscript via Unpaywall)",
  };
  browzine.script = document.createElement("script");
  browzine.script.src = "https://s3.amazonaws.com/browzine-adapters/primo/browzine-primo-adapter.js";
  document.head.appendChild(browzine.script);
  app.controller('digitalBookTitleButtonController', ['$scope', '$location', '$mdDialog', '$anchorScroll', function($scope, $location, $mdDialog, $anchorScroll) {
    this.$onInit = function(){
      {
        window.browzine.primo.searchResult($scope);
      }
    };
  }]);
  // BrowZine - END
  // BrowZine - END
  // BrowZine - END


  app.component('prmSearchResultAvailabilityLineAfter', {
    bindings: { parentCtrl: '<'},
    controller: 'digitalBookTitleButtonController',
    template: '<hathi-trust-availability entity-id="urn:mace:incommon:ucla.edu" msg="Available online with HathiTrust - UCLA Access"></hathi-trust-availability>'
  });

  /* UC Library Search Logo */
  app.component('prmJournalsAfter', {
    controller: 'chatController',
    bindings: { parentCtrl: '<'},
  });

  /*  Adds 'Browse search' page content */
  app.component('prmBrowseSearchAfter', {
    bindings: { parentCtrl: '<' },
    template: '<md-content layout-xs="column" layout="row" class="layout-align-center-start"><div flex="60" flex-xs="100" layout="column"><md-card class="default-card"><md-card-content><p class="browseContentHeadline">Search here if you already know:</p><ul><li>Author</li><li>Title (or the first few words of a title)</li><li>Subject, Call number, or Series</li></ul></md-card-content></md-card></div></md-content>'
  });

 // LibChat - START
  // LibChat - START
  // LibChat - START
  /*----------below is the code for libchat-----------*/
  app.controller('chatController', ['$scope','$http', '$mdDialog', function($scope, $http, $mdDialog) {
    var vm = this;

    this.$onInit = function(){
      {
        // do things after the DOM loads fully
        //window.addEventListener("load", function () {
        //alert('DOM is loaded');
        //document.getElementsByTagName("md-card")[0].innerHTML="<md-card-title>Search for journals</md-card-title><md-card-content><span translate=\"nui.journalsearch.category.description\">Use all the following options to find journals:</span><ul><li translate=\"nui.journalsearch.category.option1\">Enter a journal title in the search box.</li><!----><li translate=\"nui.journalsearch.category.option3\">Use the Journals by category option to browse journals by category.</li></ul></md-card-content>";
        //});

        //add BrowZine card to Journal Search page
        angular.element(document).ready(function () {
          var elem = document.getElementsByClassName("padding-medium flex-xl-50 flex-md-50 flex-lg-50");
          if(elem.length > 0){
            elem[0].innerHTML="<md-card class=\"default-card _md md-primoExplore-theme\"><md-card-title><h2 translate=\"nui.journalsearch.category.journals\">Search for journals</h2></md-card-title><md-card-content><span translate=\"nui.journalsearch.category.description\">Use the following options to find journals:</span><ul><li translate=\"nui.journalsearch.category.option1\">Enter a journal title in the search box.</li><!----><li translate=\"nui.journalsearch.category.option3\">Use the Journals by category option to browse journals by category.</li></ul></md-card-content></md-card><md-card class=\"default-card _md md-primoExplore-theme\"><md-card-title><h2 translate=\"nui.journalsearch.category.journals\">Try BrowZine!</h2></md-card-title><md-card-content><span><img src=\"https://thirdiron.com/wp-content/uploads/2020/08/4.jpg\" alt=\"Browzine logo\" width=\"300\" height=\"200\" class=\"browzine\" /></span><ul><li translate=\"nui.journalsearch.category.option1\">BrowZine is a tablet, mobile, and web application that lets you browse, read, and monitor thousands of scholarly journals available from the UCLA Library. <a href=\"https://thirdiron.com/download-browzine/\">Download it now</a> or use the <a href=\"http://browzine.com/libraries/33/\">web version</a>.</li><!----></ul></md-card-content></md-card>";
          }
        });

        $scope.chat = function() {
          var alert = $mdDialog.alert({
             title: 'Attention',
             clickOutsideToClose:true,
             template: '<div id="libchat_secret_50402955"></div>',
             scope: angular.extend($scope.$new(), { close: function() {$mdDialog.cancel();} })
          });
          $mdDialog.show(alert).finally(function() {
            alert = undefined;
          });
        }

        /*
        $scope.closeHelp = function() {
          document.getElementById('qp-need-help').style.right = '-200px';
        }
        setTimeout(function(){
          document.getElementById('qp-need-help').style.right = '0px';
        }, 15000);
        */
      }
    };
  }]);

  app.component('prmSearchResultToolBarAfter', {
    bindings: {parentCtrl: '<'},
    controller: 'chatController',
  });

  // Adds the chat button
  (function() {
    var lc = document.createElement('script'); lc.type = 'text/javascript';
    lc.src = 'https://v2.libanswers.com/load_chat.php?hash=libanswers_secret_86530858';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.append(lc);
  })();
  /*---------------libchat code ends here---------------*/
  // LibChat - END
  // LibChat - END
  // LibChat - END


/* Collapse "Get It From Other Institutions" dropdown by default in full record display - START */
/* Collapse "Get It From Other Institutions" dropdown by default in full record display - START */
/* Collapse "Get It From Other Institutions" dropdown by default in full record display - START */
/* https://www.carli.illinois.edu/products-services/i-share/discovery-interface/custom_package_collapsegetitother */
app.component("prmAlmaOtherMembersAfter", { 
  bindings: { 
    parentCtrl: "<", 
  }, 
  controller: [ 
    function() {
      var ctrl = this;

      this.$onInit = function(){
        {
          ctrl.parentCtrl.isCollapsed = true;
        }
      };
    }, 
  ], 
});
/* Collapse "Get It From Other Institutions" dropdown by default in full record display - END */
/* Collapse "Get It From Other Institutions" dropdown by default in full record display - END */
/* Collapse "Get It From Other Institutions" dropdown by default in full record display - END */


  /* Help block in no results page */
  app.component('prmNoSearchResultAfter', {
    template: '<md-card class="default-card"><md-card-title><md-card-title-text><span class="md-headline">Where can I get research help?</span></md-card-title-text></md-card-title><md-card-content><ul><li><a href="https://www.library.ucla.edu/research-teaching-support/research-help">Ask a librarian</a></li><li><a href="https://guides.library.ucla.edu/search">Guide to using UC Library Search</a></li></ul><a href="https://library.ucla.edu" target="_blank" class="md-primoExplore-theme">UCLA Library homepage</a></md-card-content></md-card>'
  });

  /* Special Collections help text box */
  app.component('requestHintComponent', {
    template: `<div layout="row" class="alert-bar margin-bottom-small layout-align-center-center layout-row" layout-align="center center" 
    style="background-color: var(--color-primary-blue-02); border: 1px solid var(--color-primary-blue-04); border-radius: 3px; min-height: 45px; text-align:center">
      <span class="bar-text margin-right-medium" >For Library Special Collections, UCLA Film and Television Archive, and Clark Library materials, select the item's location below to display the Request link.</span></div>`
  });
  
  app.component('prmRequestServicesAfter', {
    bindings: {parentCtrl: `<`},
    template: `<request-hint-component></request-hint-component>`    
  });
  /* Ethical Description Note */
  app.component('ethicalDescriptionNote', {
    template: `<div id="ed-box">
      <div id="ed-text">We are committed to updating our catalog records and finding aids whenever feasible 
      to revise problematic descriptions and subjects, including the addition of relevant context.
      <b>To report harmful language, please use 
      <a href="https://ucla.libwizard.com/id/38f45c482a5fcb0b715a7e9e3ddee8b2" target="_blank" rel="noopener noreferrer">this form</a>.</b> 
      </div></div>`
  });

  app.component('prmServiceDetailsAfter', {
    bindings: {parentCtrl: `<`},
    template: `<ethical-description-note></ethical-description-note>`    
  });
}());


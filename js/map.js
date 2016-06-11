var app = angular.module('AngularGoogleMap', ['google-maps']);

app.factory('MarkerCreatorService', function () {

    var markerId = 0;

    function create(latitude, longitude) {
        var marker = {
            options: {
                animation: 0,
                labelClass: 'markerlabel'    
            },
            latitude: latitude,
            longitude: longitude,
            id: ++markerId          
        };
        return marker;        
    }

    function invokeSuccessCallback(successCallback, marker) {
        if (typeof successCallback === 'function') {
            successCallback(marker);
        }
    }

    function createByCoords(latitude, longitude, successCallback) {
        var marker = create(latitude, longitude);
        invokeSuccessCallback(successCallback, marker);
    }


    return {
        createByCoords: createByCoords
    };

});

app.controller('MapCtrl', ['MarkerCreatorService', '$scope', '$http', function (MarkerCreatorService, $scope, $http) {
        
    $scope.url = "http://52.25.24.139:8746";

    buscarDenuncias = function() { $http.get($scope.url + '/denuncia/simple').success(function(data) {
        for (var i = data.length - 1; i >= 0; i--) {
            if(data[i].tipoDenuncia == 'ILUMINACAO'){
                data[i].icon = "http://findicons.com/files/icons/2360/spirit20/20/bulb.png";
            }else if(data[i].tipoDenuncia == 'PAVIMENTACAO'){
                data[i].icon = "http://www.mtocdn.ca/graphics/english/traveller/trip/icon-roadwork-20x20.gif";
            }else if(data[i].tipoDenuncia == 'VANDALISMO'){
                data[i].icon = "http://www.myiconfinder.com/uploads/iconsets/20-20-18f02458a8ec5089234adc130df29115-paint.png"
            }else if(data[i].tipoDenuncia == 'ESTACIONAMENTO'){
                data[i].icon = "http://www.grasmarksgarden.com/images/handi_icon_small.png"
            }else if(data[i].tipoDenuncia == 'VIGILANCIA_SANITARIA'){
                data[i].icon = "http://static2.lioden.com/images/layout/icon_stinkbug.png"
            }else if (data[i].tipoDenuncia == 'LIXO'){
                data[i].icon = "http://www.myiconfinder.com/uploads/iconsets/20-20-e03a4514f39554f4bedb6adc9d39407e.png";               
            }else {
                data[i].icon = "https://www.business.qld.gov.au/__data/assets/image/0020/17192/icon_alert.png";
            }
        }
        $scope.coordenadas = data;
        
    })};
    buscarDenuncias()
        
    $scope.address = '';

    $scope.map = {
        center: {
            latitude:-26.198314,
            longitude: -52.692635
        },
        zoom: 13,
        markers: [],
        control: {},
        options: {
            scrollwheel: true
        }
    };

    $scope.infoWindow;

    $scope.marker = {
        
        events: {
            click: function (marker, eventName, args) {
                 $http.get($scope.url + '/denuncia/'+ marker.key ).success(function(data) {
                    var contentString = '<div id="content">'+
                      '<div id="siteNotice">'+
                      '</div>'+
                      '<h1 id="firstHeading" class="headerPopup">' + data.tipoDenuncia + '</h1>'+
                      '<div id="bodyContent">'+
                      '<img alt="Embedded Image" class="image-map" src="data:image/png;base64,' + data.foto + '" />'+
                      '</div>'+
                      '<h1 id="firstHeading" class="firstHeading">' + data.observacao+'</h1>'+
                      '<div  style="text-align: center">' + 
                        '<button onClick="fechar()" >'+ 
                        'Fechar'+ 
                        '</button>'+
                        '<div class="divider"/>' + 
                        '<button onClick="excluiImagem(\''+ data.id + '\')" >'+ 
                        'Concluir'+ 
                        '</button>'+ 
                      '</div>'
                      '</div>';
                    var infoWindowOptions = { 
                        content: contentString
                    };
                    $scope.infoWindow = new google.maps.InfoWindow(infoWindowOptions);
                    $scope.infoWindow.open($scope.map, marker);
                });
                
            }
        }
    }, 

    fechar = function(){
        $scope.infoWindow.close();                         
    },

    excluiImagem = function(idImagem){
        console.log(idImagem);
        $http.delete($scope.url+'/denuncia/'+ idImagem).success(function(data) {
            if($scope.infoWindow != null){
                $scope.infoWindow.close();             
                buscarDenuncias();
            }
        });            
    }
}]);

/*global WildRydes _config*/

var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};



function openForm() {
    document.getElementById("form").style.display = "block";
}

function closeForm() {
    document.getElementById("form").style.display = "none";
}

//we get the names on click
function getName(){
    let Uname = document.getElementById("unicornName").value;
    let Ugender = document.getElementById("unicornGender").value;
    let Ucolor = document.getElementById("unicornColor").value;
    
    return {Uname, Ugender, Ucolor};
}



(function rideScopeWrapper($) {
    var authToken;
    WildRydes.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });
    function requestUnicorn(pickupLocation) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/ride',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                PickupLocation: {
                    Latitude: pickupLocation.latitude,
                    Longitude: pickupLocation.longitude,
                    Uname: "Tarliquar",
                    Ucolor: "Black",
                    Ugender: "Female"
                },
                
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
            }
        });
    }
    
    
    function completeRequest(result) {
        var unicorn;
        var pronoun;
        console.log('Response received from API: ', result);
        unicorn = result.Unicorn;
        pronoun = unicorn.Gender === 'Male' ? 'his' : 'her';
        displayUpdate(unicorn.Name + ', your ' + unicorn.Color + ' unicorn, is on ' + pronoun + ' way.');
        animateArrival(function animateCallback() {
            displayUpdate(unicorn.Name + ' has arrived. Giddy up!');
            WildRydes.map.unsetLocation();
//            $('#request').prop('disabled', 'disabled');
//            $('#request').text('Set Pickup');
        });
    }
    
    
    
    // Register click handler for #request button
    $(function onDocReady() {
        $('#form').submit(function(e){
            $('#request').click(handleRequestClick);
            //prevent reload
            e.preventDefault();
        });
        
        //$('#request').click(handleRequestClick);
        //$(WildRydes.map).on('pickupChange', handlePickupChanged);

        WildRydes.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });
    
    
    function handlePickupChanged() {
        var requestButton = $('#request');
        requestButton.text('Request Unicorn');
        requestButton.prop('disabled', false); 
    }
    
    function handleNameTag() {
        var requestButton = $('#request');
        var uname = $('#unicornName').val();
        if (uname === "") {
            requestButton.prop('disabled', 'disabled');
            requestButton.text('Set Pickup');
        }else {
            requestButton.text('Request Unicorn');
            requestButton.prop('disabled', false); 
        }
    }
    
    
    function handleRequestClick(event) {
        var pickupLocation = WildRydes.map.selectedPoint;
        requestUnicorn(pickupLocation);
        event.preventDefault();
    }

    function animateArrival(callback) {
        var dest = WildRydes.map.selectedPoint;
        var origin = {};

        if (dest.latitude > WildRydes.map.center.latitude) {
            origin.latitude = WildRydes.map.extent.minLat;
        } else {
            origin.latitude = WildRydes.map.extent.maxLat;
        }

        if (dest.longitude > WildRydes.map.center.longitude) {
            origin.longitude = WildRydes.map.extent.minLng;
        } else {
            origin.longitude = WildRydes.map.extent.maxLng;
        }

        WildRydes.map.animate(origin, dest, callback);
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));

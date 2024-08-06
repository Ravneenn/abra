// Cookie'den CSRF Tokeni Al
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');


$(document).ready(function() {
    
    var pathname = window.location.pathname;
    var parts =pathname.split("/");
    var slug = parts[parts.length - 1];

    var detailSection = $(".detailSection");

    function renderer(){
        $.ajax({
            url: "/reportDetail/read/ajax/" + slug,
            method: "GET",
            dataType: "json",
            success: function (response) { 
                rendered = response.rendered
                detailSection.html(rendered)
    
                $("#onayla").on('click', function () { 
                    var objectId = $(this).data('object-id');
                    var objectName = $(this).data('object-name');
                
                    $.ajax({
                        url: "/reports/report-status-update/ajax/" + objectId,
                        method: "POST",
                        data: {
                            'reportId': objectId,
                            'status': objectName,
                            'csrfmiddlewaretoken': csrftoken
                        },
                        success: function (response) { 
                            renderer();
                        },
                        error: function (xhr, status, error) { 
                            console.log("Hata: ", error);
                        }
                    });
                });
    
                $("#revize").on('click', function () { 
                    var objectId = $(this).data('object-id');
                    var objectName = $(this).data('object-name');

                    $("#create_revise-modal").modal('show');
                    
                
                    $.ajax({
                        url: "/reports/report-status-update/ajax/" + objectId,
                        method: "POST",
                        data: {
                            'reportId': objectId,
                            'status': objectName,
                            'csrfmiddlewaretoken': csrftoken
                        },
                        success: function (response) { 
                            renderer();
                        },
                        error: function (xhr, status, error) { 
                            console.log("Hata: ", error);
                        }
                    });
                });

                $("#onay_bekliyor").on('click', function () { 
                    var objectId = $(this).data('object-id');
                    var objectName = $(this).data('object-name');
                
                    $.ajax({
                        url: "/reports/report-status-update/ajax/" + objectId,
                        method: "POST",
                        data: {
                            'reportId': objectId,
                            'status': objectName,
                            'csrfmiddlewaretoken': csrftoken
                        },
                        success: function (response) { 
                            renderer();
                        },
                        error: function (xhr, status, error) { 
                            console.log("Hata: ", error);
                        }
                    });
                });


                
                
                
                
             },
            errors: function (response) { 
                alert(res)
             }
    
        })

    };

    renderer();


    

    

        
});





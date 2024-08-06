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
    // AJAX ayarlarında CSRF token'ı ekleme
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken); // Doğru token'i kullanma
            }
        }
    });

    // Raporları Yükleme
    var userLoggedIn = undefined;
    var reportsField = $(".reports-field");
    var reportsFieldAmin = $(".reports-field-admin");
    var workChoices = $(".workChoices");


    //RAPORLARIN ÇEKİLMESİ DEVAMINDAKİ UPDATE VE DELETE İŞLEMLER

    //User

    $.ajax({
        url: "/reports/read/ajax",
        method: "GET",
        dataType: "json",
        success: function(response) {
            reportsField.html(response.html);
            userLoggedIn = response.userLoggedIn

            
            //SİLME ONAY MODALI
            $(document).on('click', '#start-delete', function() {
                var objectId = $(this).data('object-id');
                $('#deleteReportModal').data('object-id', objectId);
                $('#deleteReportModal').modal('show');
            });
            //SİLME İŞLEMİ
            $(document).on('click', '#confirm-delete', function() {
                var objectId = $('#deleteReportModal').data('object-id');
                $.ajax({
                    url: "/reports/delete/ajax/" + objectId,
                    type: "POST",
                    data: {
                        'csrfmiddlewaretoken': csrftoken
                    },
                    success: function(response) {
                        if (response.status === 'success') {
                            $("#deleteReportSuccesModal").modal("show")
                            // Rapor öğesini DOM'dan kaldırma
                            $("#report-" + objectId).remove();
                            $("#deleteReportModal").modal("hide")
                        } else {
                            alert('Error: ' + response.message);
                        }

                    },
                    error: function(response) {
                        alert('Error: Object could not be deleted.');
                        console.log(response);
                        console.error(response.responseJSON.message);
                    }
                });
            });

            //UPDATE MODALI AÇILIS
            $(document).on('click', '#start-update', function() {
                var objectId = $(this).data('object-id');
                $('#updateReportModal').data('object-id', objectId);
                $('#updateReportModal').modal('show');
                $.ajax({
                    url: "http://127.0.0.1:8000/api/reports/" + objectId,
                    method: "GET",
                    dataType: 'json',
                    success: function(data) {
                        $("#name").val(data.name);
                        $("#description").val(data.description);
                        if (data.img == null) {}
                        else{
                            var img = $('<img>', { 
                                src: data.img,
                                alt: data.slug,
                                width: '480px',  
                                height: 'auto' });
                            $('#image-container').html(img);
                        }
                        workChoices.val(data.relatedWork);
                    },
                })
            });

            //UPDATE FORMU GÖNDERİMİ
             $('#update_report').on('submit', function(event) {
                var objectId = $('#updateReportModal').data('object-id');
                event.preventDefault(); // Sayfanın yeniden yüklenmesini durdur
                event.stopPropagation();
        
                var formData = new FormData(this);
                formData.append('csrfmiddlewaretoken', csrftoken);
        
                // AJAX çağrısı
                $.ajax({
                    url: '/reports/update/ajax/' + objectId,
                    method: 'POST',
                    data: formData,
                    dataType: 'json',
                    contentType: false,
                    processData: false,
                    success: function(data) {
                        if (data.success) {
                            $('#updateReportModal').modal("hide");
                            $("#updateReportSuccesModal").modal("show")
                            
                            $.ajax({
                                url: "/reports/read/ajax/" + objectId ,
                                method: "GET",
                                dataType: "json",
                                success: function(response) {
                                    $("#report-" + objectId).remove();
                                    reportsField.prepend(response.html);
                                    $('#create_report')[0].reset();
                                    
                                },
                                error: function(xhr, status, error) {
                                    console.error("Hata: ", error);
                                    alert("Bir hata oluştu: " + error);
                                }
                            }); // Yeni raporun HTML'i
                            $('#updateReportModal').modal('hide');
                        } else {
                            alert('Bir hata oluştu!');
                            console.log(data.errors);
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Hata:', error);
                        alert('Hata ajaxtan geldi: ' + error);
                    }
                });
            });

             
        },
        error: function(xhr, status, error) {
            console.error("Hata: ", error);
            alert("Bir hata oluştus: " + error);
        }
    });

    //Admin

    $.ajax({
        url: "/reports/read-all/ajax",
        method: "GET",
        dataType: "json",
        success: function(response) {
            reportsFieldAmin.html(response.html);
            userLoggedIn = response.userLoggedIn
            //RELATEDWORKS SEÇENEKLERİNİ ÇEKME
            $.ajax({
                url: "/works/read/by-user/ajax/" + userLoggedIn,
                method : "GET",
                dataType: "Json",
                success: function (response) { 
                    var allRelatedWorks = response.works;   
                    var noneOption = "<option value=''> None </option>";
                    workChoices.append(noneOption);
                    allRelatedWorks.forEach(relatedWork => {
                        var option = "<option value='" + relatedWork.id + "'>" + relatedWork.name + "</option>";
                        workChoices.append(option);
                    });
                    workChoices.clear();
                },
                error: function (response) { 
                    alert(response.errors)
                }
            });
            
            //SİLME ONAY MODALI
            $(document).on('click', '#start-delete', function() {
                var objectId = $(this).data('object-id');
                $('#deleteReportModal').data('object-id', objectId);
                $('#deleteReportModal').modal('show');
            });
            //SİLME İŞLEMİ
            $(document).on('click', '#confirm-delete', function() {
                var objectId = $('#deleteReportModal').data('object-id');
                $.ajax({
                    url: "/reports/delete/ajax/" + objectId,
                    type: "POST",
                    data: {
                        'csrfmiddlewaretoken': csrftoken
                    },
                    success: function(response) {
                        if (response.status === 'success') {
                            $("#deleteReportSuccesModal").modal("show")
                            // Rapor öğesini DOM'dan kaldırma
                            $("#report-" + objectId).remove();
                            $("#deleteReportModal").modal("hide")
                        } else {
                            alert('Error: ' + response.message);
                        }
    
                    },
                    error: function(response) {
                        alert('Error: Object could not be deleted.');
                        console.log(response);
                        console.error(response.responseJSON.message);
                    }
                });
            });
    
            //UPDATE MODALI AÇILIS
            $(document).on('click', '#start-update', function() {
                var objectId = $(this).data('object-id');
                $('#updateReportModal').data('object-id', objectId);
                $('#updateReportModal').modal('show');
                $.ajax({
                    url: "http://127.0.0.1:8000/api/reports/" + objectId,
                    method: "GET",
                    dataType: 'json',
                    success: function(data) {
                        $("#name").val(data.name);
                        $("#description").val(data.description);
                        if (data.img == null) {}
                        else{
                            var img = $('<img>', { 
                                src: data.img,
                                alt: data.slug,
                                width: '480px',  
                                height: 'auto' });
                            $('#image-container').html(img);
                        }
                        workChoices.val(data.relatedWork);
                    },
                })
            });
    
            //UPDATE FORMU GÖNDERİMİ
             $('#update_report').on('submit', function(event) {
                var objectId = $('#updateReportModal').data('object-id');
                event.preventDefault(); // Sayfanın yeniden yüklenmesini durdur
                event.stopPropagation();
        
                var formData = new FormData(this);
                formData.append('csrfmiddlewaretoken', csrftoken);
        
                // AJAX çağrısı
                $.ajax({
                    url: '/reports/update/ajax/' + objectId,
                    method: 'POST',
                    data: formData,
                    dataType: 'json',
                    contentType: false,
                    processData: false,
                    success: function(data) {
                        if (data.success) {
                            $('#updateReportModal').modal("hide");
                            $("#updateReportSuccesModal").modal("show")
                            
                            $.ajax({
                                url: "/reports/read/ajax/" + objectId ,
                                method: "GET",
                                dataType: "json",
                                success: function(response) {
                                    $("#report-" + objectId).remove();
                                    reportsFieldAmin.prepend(response.html);
                                    $('#create_report')[0].reset();
                                    
                                },
                                error: function(xhr, status, error) {
                                    console.error("Hata: ", error);
                                    alert("Bir hata oluştu: " + error);
                                }
                            }); // Yeni raporun HTML'i
                            $('#updateReportModal').modal('hide');
                        } else {
                            alert('Bir hata oluştu!');
                            console.log(data.errors);
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Hata:', error);
                        alert('Hata ajaxtan geldi: ' + error);
                    }
                });
            });

            //ADMIN STATUS GUNCELLEME AÇILIŞ
            $('#workStatus').change(function() {
                var objectId = $(this).data('object-id');
                var selectedOption = $(this).val();
                $('#statusUpdateReportModal').modal('show');

                 //ADMIN STATUS GUNCELLEME AJAX İŞLEMİ
                $("#confirm-statusUpdate").on("click", function (param) {

                    var formData = new FormData();
                    formData.append('status', selectedOption);
                    formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));

                    $.ajax({
                        url: "/reports/work-status-update/ajax/" + objectId,
                        method: "POST",
                        data: formData,
                        dataType: 'json',
                        contentType: false,
                        processData: false,
                        success: function (data) {
                            $('#statusUpdateReportModal').modal('hide');
                            $('#statusUpdateReportSuccesModal').modal('show');
                            
                            $.ajax({
                                url: "/reports/read/ajax/" + objectId ,
                                method: "GET",
                                dataType: "json",
                                success: function(response) {
                                    $("#report-" + objectId).remove();
                                    reportsFieldAmin.prepend(response.html);
                                    $('#create_report')[0].reset();
                                    
                                },
                                error: function(xhr, status, error) {
                                    console.error("Hata: ", error);
                                    alert("Bir hata oluştu: " + error);
                                }
                            });
                        },
                        error: function (xhr, status, error) {
                            var errors = JSON.parse(xhr.responseText).errors;
                            alert(errors.join("\n"));
                        }
                    })
                 })
            });

           

            
    
             
        },
        error: function(xhr, status, error) {
            console.error("Hata: ", error);
            alert("Bir hata oluştus: " + error);
        }
    });


    // Rapor Oluşturma Modali Açma
    $(".start-create").on("click", function () {   
        $("#createReportModal").modal("show");     
    });

    // Rapor Oluşturma Formu Gönderimi
    $('#create_report').on('submit', function(event) {
        event.preventDefault(); // Sayfanın yeniden yüklenmesini durdur
        event.stopPropagation();

        var formData = new FormData(this);
        formData.append('csrfmiddlewaretoken', csrftoken);

        // AJAX çağrısı
        $.ajax({
            url: $(this).attr('action'),
            method: 'POST',
            data: formData,
            dataType: 'json',
            contentType: false,
            processData: false,
            success: function(data) {
                if (data.success) {
                    $("#createReportSuccesModal").modal("show")
                    var reportId = data.reportId;
                    $.ajax({
                        url: "/reports/read/ajax/" + reportId ,
                        method: "GET",
                        dataType: "json",
                        success: function(response) {
                            reportsField.prepend(response.html);
                            reportsFieldAmin.prepend(response.html);
                            $('#create_report')[0].reset();
                            
                        },
                        error: function(xhr, status, error) {
                            console.error("Hata: ", error);
                            alert("Bir hata oluştu: " + error);
                        }
                    }); // Yeni raporun HTML'i
                    

                    $('#createReportModal').modal('hide');
                } else {
                    alert('Bir hata oluştu!');
                    console.log(data.errors);
                }
            },
            error: function(xhr, status, error) {
                console.error('Hata:', error);
                alert('Hata ajaxtan geldi: ' + error);
            }
        });
    });



    $(document).on('click', '#cancel-button', function() {
        // Modal'ı aç veya başka bir işlem yap
        $('.modal').modal('hide');
        });

        
});





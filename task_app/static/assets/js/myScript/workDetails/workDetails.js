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
    
    
    //GÖREV OLUŞTUR

    $("#start-create-relatedWork").on("click", function () {
        $("#create-relatedWork-modal").modal("show");
        var objectId = $(this).data('object-id');
        var objectName = $(this).data('object-name'); // Eğer work ismini alabiliyorsanız
    
        // relatedWork select elementinin değerini ayarlayın
        $('#relatedWork').empty();
        var selector = document.getElementById("relatedWork");
        
        // Option elementini bulmak için var olan seçenekler arasında gez
        var optionExists = false;
        for (var i = 0; i < selector.options.length; i++) {
            if (selector.options[i].value == objectId) {
                optionExists = true;
                break;
            }
        }
    
        // Eğer option yoksa, yeni bir option ekle
        if (!optionExists) {
            var newOption = new Option(objectName, objectId);
            selector.add(newOption);
        }
    
        // Seçeneği seçili yap
        selector.value = objectId;
    
        $('#createForm').on('submit', function(event) {
            event.preventDefault(); // Formun normal şekilde gönderilmesini engeller
            
            var formData = new FormData(this);
            formData.append('csrfmiddlewaretoken', csrftoken); // Eğer csrf_token zaten formda varsa bu satıra gerek yok
        
            $.ajax({
                url: $(this).attr('action'), // Formun action attribute'ünden URL'yi al
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(data) {
                    if (data.success) {
                        // Başarı modalını göster
                        $('#successModal').modal("show");
                    } else {
                        alert('Bir hata oluştu!');
                        // Hataları göster
                        console.log(data.errors);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Hata:', error);
                }
            });
        });
    });

    $('#successModalCloseBtn').on('click', function() {
        $('#successModal').modal('hide'); // Modalı kapat
        location.reload(); // Sayfayı yenile
    });

    //RAPOR OLUŞTURMA

    $("#start-create-report").on("click", function () {  
        
        var objectId = $(this).data('object-id');
        var objectName = $(this).data('object-name'); // Eğer work ismini alabiliyorsanız
    
        // relatedWork select elementinin değerini ayarlayın
        $('#relatedWork').empty();
        var selector = document.getElementById("relatedWork");
        
        // Option elementini bulmak için var olan seçenekler arasında gez
        var optionExists = false;
        for (var i = 0; i < selector.options.length; i++) {
            if (selector.options[i].value == objectId) {
                optionExists = true;
                break;
            }
        }
    
        // Eğer option yoksa, yeni bir option ekle
        if (!optionExists) {
            var newOption = new Option(objectName, objectId);
            selector.add(newOption);
        }
    
        // Seçeneği seçili yap
        selector.value = objectId;


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



    // Silme Modal açılırken çalışacak
    $('.open-delete-modal').on('click', function() {
        objectId = $(this).data('work-id');
        $('#confirmDeleteButton').data('work-id', objectId);
    });

    // Silme işlemini başlatan fonksiyon
    $('#confirmDeleteButton').on('click', function() {
        objectId = $(this).data('work-id');
        deleteObject(objectId);
    });

    // Silme AJAX isteği
    function deleteObject(objectId) {
        $.ajax({
            url: "/delete/ajax/" + objectId + "/",
            type: "POST",
            data: {
                'csrfmiddlewaretoken': csrftoken
            },
            success: function(response) {
                if (response.status === 'success') {
                    $('#successDeleteModal').modal('show');
                    $('.modal').modal('hide');
                }
            },
            error: function(response) {
                alert('Error: Object could not be deleted.');
            }
        });
    }

    $('#close-delete-success-modal').on('click', function() {
        $('.modal').modal('hide');
        window.location.href= "/work_list";
         // Tüm açık modalları kapat
    });

    var workId = null;
    $('.open-edit-modal').click(function() {
        workId = $(this).data('work-id');
        $("#editModal").modal("show");
        $.ajax({
            url: 'http://127.0.0.1:8000/api/workss/' + workId + "/",
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                $("#editForm #name").val(data.name);
                $("#editForm #description").val(data.description);
                
                if (data.img == null) {     
                }else{
                    var img = $('<img>', { 
                        src: data.img,
                        alt: data.slug,
                        width: '480px',  // İsteğe bağlı: Görsel genişliği
                        height: 'auto'  // İsteğe bağlı: Görsel yüksekliği
                    });
                    $('#editForm #image-container').html(img);
                }


                if (data.deadline) {
                    const dateValue = new Date(data.deadline);
                    if (!isNaN(dateValue.getTime())) {
                        const formattedDate = dateValue.toISOString().split('T')[0];
                        $('#editForm #deadline').val(formattedDate);
                    } else {
                        console.error('Geçersiz tarih formatı:', data.deadline);
                    }
                }
                $("#editForm #relatedWork").val(data.relatedWork);
                $("#editForm #appointed").val(data.appointed);
            },
            error: function(xhr, status, error) {
                console.error('AJAX isteği başarısız:', status, error);
                alert('AJAX isteği başarısız:', status, error);
            }
        });
        $('#editForm').on('submit', function (event) {
            event.preventDefault();
            var formData = new FormData(this);
            $.ajax({
                url: '/edit/ajax/' + workId + '/',
                method : 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    if (response.success) { 
                        $('#successEditModal').modal('show'); // Başarılı modalını göster
                    } else {
                        alert('Görev güncellenemedi.');
                        alert(response.errors); // Hata mesajlarını göster
                        $('#editModal').modal('hide');
                    }
                },
                error: function() {
                    alert('Bir hata oluştu.');
                    $('#editModal').modal('hide');
                }
            })
        })
        
        $('.close_edits_modals').on('click', function (event) {
            $("#editModal").modal("hide");
        })


        $('#close-edit-success-modal').on('click', function() {
            $('#close-edit-success-modal').modal("hide");
            window.location.href= "/work_list";

            
             // Tüm açık modalları kapat
        });
    });

 

    

});





$(document).ready(function() {
    var workId = null;
    $('.open-edit-modal').click(function() {
        workId = $(this).data('work-id');
        $("#editModal").modal('show');
        $.ajax({
            url: 'http://127.0.0.1:8000/api/workss/' + workId + "/",
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                $("#name").val(data.name);
                $("#description").val(data.description);
                
                if (data.img == null) {
                    
                }else{
                    var img = $('<img>', { 
                        src: data.img,
                        alt: data.slug,
                        width: '480px',  // İsteğe bağlı: Görsel genişliği
                        height: 'auto'  // İsteğe bağlı: Görsel yüksekliği
                    });
                    $('#image-container').html(img);
                }


                if (data.deadline) {
                    const dateValue = new Date(data.deadline);
                    if (!isNaN(dateValue.getTime())) {
                        const formattedDate = dateValue.toISOString().split('T')[0];
                        $('#deadline').val(formattedDate);
                    } else {
                        console.error('Geçersiz tarih formatı:', data.deadline);
                    }
                }
                $("#relatedWork").val(data.relatedWork);
                $("#appointed").val(data.appointed);
            },
            error: function(xhr, status, error) {
                console.error('AJAX isteği başarısız:', status, error);
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
        $('#close-edit-success-modal').on('click', function() {
            $('.modal').modal('hide');
            window.location.reload();
             // Tüm açık modalları kapat
        });
    });
});
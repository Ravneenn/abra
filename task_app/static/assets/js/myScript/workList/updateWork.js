$(document).ready(function() {
    var workId = null;

    //GÜNCELLEME FONKSİYONLARI

    $('.open-update-modal').on('click', function() {
        workId = $(this).data('work-id');
    });

    $('#confirm-update').on('click', function() {
        if (workId) {
            var row = $('tr[data-work-id="' + workId + '"]');
            var deadline = row.find('input[name="deadline"]').val();
            var status = row.find('select[name="status"]').val();

            console.log('Deadline:', deadline);
            console.log('Status:', status);

            $.ajax({
                url: '/update/ajax/' + workId + '/',
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                data: {
                    deadline: deadline,
                    status: status
                },
                success: function(response) {
                    if (response.success) {
                        $('#updateModal').modal('hide');  // Önce update modalını kapat
                        $('#successupdateModal').modal('show'); // Başarılı modalını göster
                    } else {
                        alert('Görev güncellenemedi.');
                        alert(response.errors); // Hata mesajlarını göster
                        $('#updateModal').modal('hide');
                    }
                },
                error: function() {
                    alert('Bir hata oluştu.');
                    $('#updateModal').modal('hide');
                }
            });
        }
    });

    // Güncelleme Başarılı Mesajı Modal Kapatıldığında Diğer Tüm Açık Modalları Kapat
    $('#close-update-success-modal').on('click', function() {
        $('.modal').modal('hide');
        window.location.reload();
         // Tüm açık modalları kapat
    });


    })
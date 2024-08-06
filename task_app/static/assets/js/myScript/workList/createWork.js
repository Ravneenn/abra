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
    $('form').on('submit', function(event) {
        event.preventDefault(); // Formun normal şekilde gönderilmesini engeller

        var formData = new FormData(this);

        $.ajax({
            url: $(this).attr('action'), // Formun action attribute'ünden URL'yi al
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                'X-CSRFToken': '{{ csrf_token }}'
            },
            success: function(data) {
                if (data.success) {
                    // Modalı göster
                    $('#successModal').modal('show');
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


    $('#successModalCloseBtn').on('click', function() {
        $('#successModal').modal('hide'); // Modalı kapat
        location.reload(); // Sayfayı yenile
    });

});

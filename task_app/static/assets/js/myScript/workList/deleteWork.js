$(document).ready(function() {

var objectId;

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
        window.location.reload();
         // Tüm açık modalları kapat
    });
})
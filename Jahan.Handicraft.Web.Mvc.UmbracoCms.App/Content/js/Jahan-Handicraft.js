
function submitForm() {
    var frm = document.getElementsByName('frmContact')[0];
    //var emailValidation = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    var errorFree = true;
    //var fullName = $("#FullName").val();
    //var email = $("#Email").val();
    //var textMessage = $("#TextMessage").val();
    //if (fullName.length === 0) {
    //    $("#fullnameError").removeClass("wpcf7-not-valid-tip errorValidation").addClass("wpcf7-not-valid-tip errorValidation_show");
    //    errorFree = false;
    //} else {
    //    $("#fullnameError").removeClass("wpcf7-not-valid-tip errorValidation_show").addClass("wpcf7-not-valid-tip errorValidation");
    //}

    //if (email.length === 0) {
    //    $("#emailIsEmptyError").removeClass("errorValidation").addClass("wpcf7-not-valid-tip errorValidation_show");
    //    errorFree = false;
    //} else {
    //    $("#emailIsEmptyError").removeClass("errorValidation_show").addClass("wpcf7-not-valid-tip errorValidation");
    //}
    //if (!emailValidation.test(email)) {
    //    $("#invalidEmailError").removeClass("errorValidation").addClass("wpcf7-not-valid-tip errorValidation_show");
    //    errorFree = false;
    //} else {
    //    $("#invalidEmailError").removeClass("errorValidation_show").addClass("wpcf7-not-valid-tip errorValidation");
    //}

    //if (textMessage.length === 0) {
    //    $("#textMessageError").removeClass("errorValidation").addClass("wpcf7-not-valid-tip errorValidation_show");
    //    errorFree = false;
    //} else {
    //    $("#textMessageError").removeClass("errorValidation_show").addClass("wpcf7-not-valid-tip errorValidation");
    //}

    if (!errorFree) {
        event.preventDefault();
    }
    else {
        // No errors: Form will be submitted.
        frm.submit(); // Submit
      
        return false; // Prevent page refresh
        frm.reset();  // Reset
    }
    return false;
}

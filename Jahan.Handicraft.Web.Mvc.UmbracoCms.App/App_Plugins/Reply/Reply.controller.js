angular.module("umbraco").controller("Reply.controller", function ($scope, $http, $routeParams) {
	$scope.SendReply = function () {
		var sendTo = $("#Email").val();
	    var textMessage="";
	    var replyText="";

		var textMessageList = $("[id*='TextMessage']");
		var i;
		for (i = 0; i < textMessageList.length; ++i) {
		    var text = textMessageList[i].value;
            if (!(text === "" || text === null)) {
                textMessage = text;
            }
		}
		
		var replyList = $("[id*='Reply']");
		
		for (i = 0; i < replyList.length; ++i) {
		    var rText = replyList[i].value;
		    if (!(rText === "" || rText === null)) {
		        replyText = rText;
		    }
		}

		var contentId = $routeParams.id;
		
		var email = $("#Email").val();
	    var fullName = $("#FullName").val();
		$scope.xxx = "I'm here!";
		var dataObj = {
			TextMessage: textMessage,
			ReplyText: replyText,
			SendTo: sendTo,
			ContentId: contentId,
			Email: email,
            FullName: fullName
		};
		$http.post("backoffice/Reply/ReplyToIncomingCall/ReplyMessage", dataObj).then
	    (
	        function (response) {
	        	alert("YES!");
	        	//TODO: 
	        }
		);
	}
});
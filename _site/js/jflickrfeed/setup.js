$(document).ready(function(){

	$('#basicuse').jflickrfeed({
		limit: 4,
		qstrings: {
			id: '37304598@N02'
		},
		itemTemplate: '<li><a href="{{image_b}}"><img src="{{image_s}}" alt="{{title}}" /></a></li>'
	});

	$('#nocallback').jflickrfeed({
		limit: 4,
		qstrings: {
			id: '37304598@N02'
		},
		useTemplate: false,
		itemCallback: function(item){
			$(this).append("<li><img src='" + item.image_m + "' alt=''/></li>");
		}
	});

	$('#bannerflickr').jflickrfeed({
		limit: 4,
		qstrings: {
			id: '106195235@N05'
		},
		useTemplate: false,
		itemCallback: function(item){
			$(this).append("<li><img src='" + item.image_m + "' alt=''/></li>");
		}
	});

	$('#bannerflickr1').jflickrfeed({
		limit: 4,
		qstrings: {
			id: '106195235@N05'
		},
		itemTemplate: '<a href="{{image_b}}" target="_blank"><img src="{{image_m}}" alt="{{title}}" /></a>'
	});

	$('#bannerflickr2').jflickrfeed({
		limit: 4,
		qstrings: {
			id: '106195235@N05'
		},
		useTemplate: false,
		itemCallback: function(item){
			$(this).append("<a href='" + item.image_m + "'><img src='" + item.image_m + "' alt=''/></a>");
		}
	});

});

$(document).on("click", "#mobile_menu", function(e){
	e.preventDefault()
	$(".mobile_menu").slideToggle();
})

$(document).on("click", "a.TEMPLAR", function(e){
	$(".mobile_menu").slideUp()
})

$(window).on("resize", function(){
	if($(window).width() > 1079){
		$(".mobile_menu").slideUp(1337);
	}
})
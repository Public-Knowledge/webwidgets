
var RepDataContactWidget = (function() {
    var myOutput = "";
    var repsData = new Object;
    var sunlightURL = 'https://congress.api.sunlightfoundation.com/' +
        'legislators/locate';
    var overlayBack = 'repcontact_overlay_background';
    var overlayDialog = 'repcontact_overlay_dialog';
    var overlayClose = 'repcontact_overlay_close';

    return {
        makeDivLink: function(url, text, options) {
            if (typeof options == 'object'){
                console.log("pre_text " + options.pre_text);	
                options = $.extend({ css_class: '', pre_text: '' }, options);
            } else {
                options = { css_class: '', pre_text: '', data_lang: '' };
            }


            return '<div>' + options.pre_text +
                '<a href="' + url + '" data-lang="' + options.data_lang +
                '" target="_blank" class="' + options.css_class +'">' + text +
                '</a></div>';
        },

        repImageTag: function(bioguideID) {
            return '<img align="left" height="275" data-cke-saved-src="" ' +
                'src="http://theunitedstates.io/images/congress/225x275/' +
                bioguideID + '.jpg" style="margin: 2px 30px;" width="225" />';
        },

        lookupPosition: function() {
            // This event fires when a button is clicked
            var zipValue = document.getElementById('myZip').value;

            //Google Analytics code to create a page view for each Rep Lookup 
            // see https://developers.google.com/analytics/devguides/
            // collection/analyticsjs/events
            //ga('send', 'event', 'category', 'action', 'label');
    
            if (typeof ga === 'function') {
                ga('send', 'event', 'button', 'click', 'zipLookup');
            }

            // Clear out any existing data
            $('#congress_members').html("Working...");

            // Call the Sunlight API
            var query_params = {
                apikey: 'e595c253eb19468c9f12d743f77226f1', zip: zipValue
            };
            $.ajax(sunlightURL, {
                data: query_params, type: 'GET', dataType: 'jsonp',
                success: function(data){
                    // Variable data constains the data we get from serverside
                    repsData = data['results'];
                    RepDataContactWidget.makeRepHTML(repsData);
                }
            });
            return false;
        },


        makeRepHTML: function(repsData) {
            $('#congress_members').html('');

            var phoneCallScript="to preserve the FCC's ability to give us " +
                "meaningful net neutrality";    
    
            for (var counter = 0; counter < repsData.length; counter++){
                var thisData = repsData[counter];
  
                bioIDLookup = repsData[counter]['bioguide_id'];
       
                var repFullName = thisData.title + ". " + thisData.first_name +
                    " " + thisData.last_name;

                //D and R to Party
                if (thisData.party.indexOf("D") > -1){
                    thisData.party = "Democrat";
                }else if (thisData.party.indexOf("R") > -1){
                    thisData.party = "Republican";
                }
                var contactInfo = "Reach " + repFullName + " at " +
                    thisData.phone;

                // Construct the output
                myOutput = '<br clear="all" /><p>' +
                    this.repImageTag(thisData.bioguide_id) +
                    '</p> <p><b>' + repFullName +
                    "</b><br/>" + thisData.party + "</p>";

                var text_params = {
                    name: repFullName,
                    phone: thisData.phone,
                    her: (thisData.gender == 'M' ? "him " : "her ")
                };
                myOutput +=
                    "<p>" + this.replaceText(this.text, text_params) + "</p>" +
                    "<br/><a href=\"#\" " +
                    "onclick=\"RepDataContactWidget.updateDialog('" +
                    repFullName + "', '" + contactInfo +
                    "');return false;\">Click here to see what to say.</a></p>";

                var contactURL = thisData.contact_form;
                if (thisData.twitter_id) {
                    var tweetURL = "https://twitter.com/intent/tweet?text=" +
                        this.tweetText + "&screen_name=" + thisData.twitter_id;

                    myOutput += '<a href="' + tweetURL + '">Tweet</a>';

                }
                $('#congress_members').append("<div class='member'>" + myOutput + "</div>");
                $("#dialog").css("z-index", "2000");
            }
        },

        updateDialog: function(repName, contactInfo) {
            $('#dialog-rep').html(repName);
            $('#rep-contact-info').html(contactInfo);
            $('#' + overlayBack).show();
        },
        makeForm: function(element) {
            var formHTML = '<div><input id="myZip" size="5" type="text" ' +
                'value="" /> <button class="next" ' +
                'onclick="RepDataContactWidget.lookupPosition();" ' +
                '>Lookup</button></div>';
            $(element).append(formHTML);
            $(element).after('<div id="congress_members"></div>');
        },
        setTweetText: function(text) {
            this.tweetText = encodeURIComponent(text);
        },

        makeOverlay: function(text) {
            text_params = {
                call_your_rep: '<span id="rep-contact-info">Call</span>',
                name: '<span id="dialog-rep">my rep</span>'
            };
            var overlayHTML = '<div id="' + overlayBack + '">' +
                '<div id="' + overlayDialog + '" title="Dialog Title">' +
                '<div id="' + overlayClose + '">&times;</div>' +
                this.replaceText(text, text_params) + '</div></div>';
            $('body').append(overlayHTML);
            var overlayBackElt = $('#' + overlayBack);
            overlayBackElt.on('click', function() { overlayBackElt.hide(); });
            $('#' + overlayClose).on('click', function() {
                overlayBackElt.hide();
            });
        },

        setup: function(options) {
            this.makeForm(options.form);
            this.setTweetText(options.tweet);
            this.makeOverlay(options.overlay);
            this.text = options.text;
        },

        replaceText: function(text, params) {
            return text.replace(/\{(\w+)\}/g, function(m, p1) {
                return (params[p1] || m);
            });
        }

    };

})();

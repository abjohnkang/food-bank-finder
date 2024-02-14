//
// Copyright	abjohn.com <https://abjohn.com>
//
// @file	foodbank_lib.js
// @brief	FoodBank Finde Lib
// @author	Johnny Kang (abjohnkang@gmail.com)
//
// @notes
// 2014.02.17   created
//

var g_dataset = null;
var g_county_list = null;

function get_table_header()
{
	var header =
	`<tr style="background-color:black;color:white;">
		<td valign=top>Name</td>
		<td valign=top>ResourceType</td>
		<td valign=top>City</td>
		<td valign=top>County</td>
		<td valign=top>Description</td>
		<td valign=top>Phone</td>
		<td valign=top>Address</td>
		<td valign=top>Note</td>
	</tr>`;

	return header;
}

function get_table_row( v )
{
	/*
		City: "Fortuna"
		County: "Humboldt"
		Description: "Serving the Eel River Valley, provides info on community resources and operates a thrift\nstore, clothing closet, and food pantry. Bilingual staff available Tuesday and Wednesday 9:30\na.m. to 11:30 a.m."
		Latitude: "40.594776"
		Longitude: "-124.142125"
		Name: "Fortuna Adventist\ncommunity Services (food Resources)"
		Notes: null
		Phone: "707-725-1166"
		Resource Type: "Food Pantry"
		State: "CA"
		Street Address: "2331 Rohnerville  Road"
		Web Link: "http://fortunaacs.com/"
		Zip Code: "95540"
		created_at: 1597098370
		id: "00000000-0000-0000-CA59-6FF5499795AB"
		sid: "row-t3a5_hmk5.xfub"
		updated_at: 1597098370
	*/
	var tmp =
	`<tr>
		<td valign=top>[Name]</td>
		<td valign=top>[ResourceType]</td>
		<td valign=top>[City]</td>
		<td valign=top>[County]</td>
		<td valign=top>[Description]</td>
		<td valign=top>[Phone]</td>
		<td valign=top>[Address]</td>
		<td valign=top>[Note]</td>
	</tr>`;

	var google_map_url = `https://www.google.com/maps/search/` + v.Latitude + `,` + v.Longitude + `?entry=tts`;
	var address = v.StreetAddress + `, ` + v.City + `, CA ` + v.ZipCode;
	
	var city = ((v.City==null) ? "":v.City);
	if (city!="") city = `<a href="javascript:search_city('#output','` + encodeURIComponent(city) + `')">` + city + `</a>`;

	var county = ((v.County==null) ? "":v.County);
	if (county!="") county = `<a href="javascript:search_county('#output','` + encodeURIComponent(county) + `')">` + county + `</a>`;

	tmp = tmp.replace('[Name]', `<a href="` + v.WebLink + `" target=_blank>` + v.Name + `</a>`);
	tmp = tmp.replace('[ResourceType]', v.ResourceType);
	tmp = tmp.replace('[City]', city);
	tmp = tmp.replace('[County]', county);
	tmp = tmp.replace('[Description]', (v.Description==null) ? "":v.Description);
	// tmp = tmp.replace('[GoogleMapLink]', `<a href="` + google_map_url + `" target=_blank>Google Map</a>`)
	tmp = tmp.replace('[Phone]', `<nobr>` + ((v.Phone==null) ? "":v.Phone) + `</nobr>`);
	tmp = tmp.replace('[Address]', `<a href="` + google_map_url + `" target=_blank>` + address + `</a>`);
	// tmp = tmp.replace('[WebLink]', `<a href="` + v.WebLink + `" target=_blank>Website</a>`);
	tmp = tmp.replace('[Note]', (v.Note==null) ? "":v.Note);
	return tmp;
}

function county_list(target)
{
	var html = '';
	g_dataset.county.forEach( function(v) {
		if (v!=null)
		{
			if (html!='') html += ' | ';
			html += `<a href="javascript:search_county('` + target + `','` + encodeURIComponent(v) + `')">` + v + `</a>`;
		}
	});

	return html;
}


function city_list(target, county)
{
	var html = '';
	g_dataset.city.forEach( function(v) {
		if (v!=null)
		{
			if (html!='') html += ' | ';
			html += `<a href="javascript:search_city('` + target + `','` + encodeURIComponent(v) + `')">` + v + `</a>`;
		}
	});

	return html;
}

function search(target, keyword)
{
	var html = '';

	// https://abjohn.com/java/196/Regular-Expressions-in-JavaScript/
	var regex = new RegExp("/" + keyword + "/i");

	g_dataset.data.forEach( function(v) {
		if (
			v.City.match(regex)
			||
			v.County.match(regex)
			||
			v.Name.match(regex)
			||
			v.StreetAddress.match(regex)
		)
		{
			html += get_table_row(v);
		}
	});

	if (html!='')
	{
		html = `<table>`
		+ get_table_header()
		+ html
		+ `</table>`;
	}

	$( target).html(html);
}

function search_city(target, city)
{
	var html = '';
	g_dataset.data.forEach( function(v) {
		if (v.City!=null)
		{
			if (city==v.City)
			{
				console.log(v);
				html += get_table_row(v);
			}
		}
	});

	if (html!='')
	{
		html = `<table>`
		+ get_table_header()
		+ html
		+ `</table>`;
	}

	html = g_county_list + `<hr>` + html;

	$( target).html(html);
}

function search_county(target, county)
{
	var html = '';
	g_dataset.data.forEach( function(v) {
		if (v.County!=null)
		{
			if (county==v.County)
			{
				console.log(v);
				html += get_table_row(v);
			}
		}
	});

	if (html!='')
	{
		html = `<table>`
		+ get_table_header()
		+ html
		+ `</table>`;
	}

	html = g_county_list + `<hr>` + html;

	$( target).html(html);
}

function display_city_list(target, county)
{
	$(target).html(city_list(target, county));
}


function display_county_list(target)
{
	$(target).html( county_list(target));
}


function load_dataset(target)
{
	// Load List
	$.ajax({
		url: "https://abjohn.com/repo/2024_01/188/foodbank_processed.json",
		success: function(json)
		{
			// copy dataset
			g_dataset = json;
			console.log(json); 

			g_county_list = county_list( target, null);

			display_county_list(target);
		}
	});
}
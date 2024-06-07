/**
 * Date				Author		Changes
 * 27-May-2019 		MJ			Created
 */

define(['N/format', 'N/search', 'N/url'],
function(format, search, url) {
	function isNotNull(value){
		var returnObj = false;
		if(value != null && value != '' && value != 'null' && value != undefined && value != 'undefined' && value != '@NONE@')
			returnObj = true;
		return returnObj;
	}
	
	function stringToDate(date) {
        var returnValue = null;
        if (date) {
            returnValue = format.parse({ value: date, type: format.Type.DATE });
        }
        return returnValue;
    }
    
    function dateToString(date) {
        var returnValue = null;
        if (date) {
            returnValue = format.format({ value: date, type: format.Type.DATE });
        }
        return returnValue;
    }
    
    function updatetheshippingDates(currentRecord) {
        try {
            // Get the fields from the record
            let transitTimeStr = currentRecord.getValue({ fieldId: 'custrecord_transit_time_days' });
            let delEndStr = currentRecord.getValue({ fieldId: 'custrecord_delivery_period_end' });
            let delStartStr = currentRecord.getValue({ fieldId: 'custrecord_delivery_period_start' });
    
            // Convert transit time to an integer
            let transitTime = parseInt(transitTimeStr, 10);
    
            // Ensure the field values are correctly retrieved
            if (isNaN(transitTime)) {
                throw new Error('Invalid transit time. Expected an integer.');
            }
    
            // Check and parse dates using stringToDate function
            let delStart = typeof delStartStr === 'string' ? stringToDate(delStartStr) : new Date(delStartStr);
            let delEnd = typeof delEndStr === 'string' ? stringToDate(delEndStr) : new Date(delEndStr);
    
            if (!(delStart instanceof Date) || isNaN(delStart.getTime())) {
                throw new Error('Invalid start date. Expected a valid date.');
            }
            if (!(delEnd instanceof Date) || isNaN(delEnd.getTime())) {
                throw new Error('Invalid end date. Expected a valid date.');
            }
    
            // Calculate shipping start date
            let shipStart = new Date(delStart);
            shipStart.setDate(delStart.getDate() - transitTime);
            let formattedShipStart = dateToString(shipStart);
    
            // Calculate shipping end date
            let shipEnd = new Date(delEnd);
            shipEnd.setDate(delEnd.getDate() - transitTime);
            let formattedShipEnd = dateToString(shipEnd);
            log.debug("formattedShipEnd", formattedShipEnd);
    
            // Set the calculated shipping start and end dates
            currentRecord.setText({
                fieldId: 'custrecord_shipping_period_start',
                text: formattedShipStart
            });
            currentRecord.setText({
                fieldId: 'custrecord_shipping_period_end',
                text: formattedShipEnd
            });
    
            // Calculate and set Delivery Period
            let daysDifference = Math.ceil((delEnd - delStart) / (1000 * 60 * 60 * 24));
            currentRecord.setValue({
                fieldId: 'custrecord_delivery_period',
                value: daysDifference
            });
    
        } catch (err) {
            log.debug('Error in updatetheshippingDates: ', err.message);
        }
    }
	
	return {
		isNotNull: isNotNull,
        getAllSearchResults: getAllSearchResults,
        dateToString: dateToString,
        stringToDate: stringToDate,
        getScriptURL: getScriptURL
    };
});
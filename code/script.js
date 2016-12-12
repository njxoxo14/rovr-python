var HIDDEN_CLASS = "hidden";
var owners = [];
var walkers = [];
var requests = [];

$(document).ready(function() {
  getData();

  $('#home').click(function() {location.reload()});

  $('#signup-button').click(function() {
    var name = $('#name').val().trim();
    var isOwner = $('#owner').is(':checked');
    var isWalker = $('#walker').is(':checked');

    if (name.length == 0 || !isOwner && !isWalker) {
      alert("Bad or missing input");
    } else {
      resetSignup();

      var callback = function(data) {
        location.reload()
      }
      if (isOwner) {
        $.post('/create/owner', { 'name': name }, callback);
      } else {
        $.post('/create/walker', { 'name': name }, callback);
      }
    }
  });
});

function resetSignup() {
  // Reset form elements.
  $('#name').val('');
  $('#owner').removeAttr('checked');
  $('#walker').removeAttr('checked');
  $('#user-selection').val('');
}

function updateWalkerSelection() {
  $('#walker-selection').empty(); // Clear all options first.

  for (var i = 0; i < walkers.length; i++) {
    $('#walker-selection').append(
        "<option value='" + walkers[i].id + "'>" + walkers[i].name + "</option>");
  }
}

function updateRequestForm(currentUserId) {
  $('#request-confirmation').addClass(HIDDEN_CLASS);
  $('#request').off("click");  // unbind previous event handler
  $('#request').click(function() {
    var date = $('#date').val().trim();
    var walker = $('#walker-selection').val();
    if (date.length == 0) {
      alert("Bad or missing input");
    } else {
      // Reset form elements.
      $('#date').val('');
      $('#walker-selection').val(0);

      $.post('/create/request', {
          owner: currentUserId,
          walker: walker,
          date: date
        }, function(data) {
          setTimeout(location.reload.bind(location), 2000);
        });
      $('#request-confirmation').removeClass(HIDDEN_CLASS);
    }
  });
}

function updateRequests(currentUserId) {
  $('#requests').empty(); // Clear the table first, then add the header.
  $('#requests').append("<tr><th>Dog owner</th><th>Date</th><th>Accept?</th></tr>");

  for (var i = 0; i < requests.length; i++) {
    var request = requests[i];
    if (request.walker !== currentUserId) {
      continue;
    }
    var owner;
    for (var j = 0; j < owners.length; j++) {
      if (owners[j].id === request.owner) {
        owner = owners[j];
        break;
      }
    }
    var name = $('<td>').text(owner.name);
    var date = $('<td>').text(request.date);
    var accept = $('<button>').addClass('btn btn-primary').text('Accept');
    var reject = $('<button>').addClass('btn btn-primary').text('Reject');
    var row = $('<tr>').append(name, date, $('<td>').append(accept, reject));
    row.attr('id', request.id);

    accept.click(function() {
      var row = $(this).closest('tr');
      $.post('/delete/request', {
        'id': row.attr('id')
      }, function() {
        setTimeout(location.reload.bind(location), 2000);
      })
    });

    reject.click(function() {
      var row = $(this).closest('tr');
      $.post('/delete/request', {
        'id': row.attr('id')
      }, function() {
        setTimeout(location.reload.bind(location), 2000);
      })
    });

    $('#requests').append(row);
  }
}

function getData(callback) {
  $.getJSON('/get', success = function(data) {
    console.log(data);
    owners = data.owners;
    walkers = data.walkers;
    requests = data.requests;
    updateWalkerSelection();
    updateRequestForm();
    updateRequests(data.user_id);
    if (callback) {
      callback();
    }
  });
}

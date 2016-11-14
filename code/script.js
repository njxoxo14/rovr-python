var HIDDEN_CLASS = "hidden";
var owners = [];
var walkers = [];
var requests = [];
var sections = ["signup", "owner-request", "walker-requests"];

$(document).ready(function() {
  getData(function() {
    showSectionOnly("signup");
  });

  $('#home').click($.proxy(showSectionOnly, null, "signup"));

  $('#signup-button').click(function() {
    var name = $('#name').val().trim();
    var isOwner = $('#owner').is(':checked');
    var isWalker = $('#walker').is(':checked');

    if (name.length == 0 || !isOwner && !isWalker) {
      alert("Bad or missing input");
    } else {
      resetSignup();

      var callback = function(data) {
        getData(function() {
          showSectionForUser(isOwner, data);
        });
      }
      if (isOwner) {
        $.post('/create/owner', { 'name': name }, callback);
      } else {
        $.post('/create/walker', { 'name': name }, callback);
      }
    }
  });

  $('#user-selection').change(function() {
    var user = $('#user-selection').val();
    if (user.length != 0) {
      var isOwner = user.startsWith('o');
      var id = parseInt(user.substr(1));
      resetSignup();
      showSectionForUser(isOwner, id);
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

function showSectionForUser(isOwner, userId) {
  if (isOwner) {
    updateRequestForm(userId);
  } else {
    updateRequests(userId);
  }
  var nextSection = isOwner ? "owner-request" : "walker-requests";
  showSectionOnly(nextSection);
}

function showSectionOnly(section) {
  for (var i = 0; i < sections.length; i++) {
    var tag = $('#' + sections[i]);
    if (section == sections[i]) {
      tag.removeClass(HIDDEN_CLASS);
    } else {
      tag.addClass(HIDDEN_CLASS);
    }
  }
}

function updateUserSelection() {
  $('#user-selection').empty(); // Clear all options first.

  $('#user-selection').append(
      "<option value=''>Please select</option>");
  for (var i = 0; i < walkers.length; i++) {
    $('#user-selection').append(
        "<option value='w" + walkers[i].id + "'>" + walkers[i].name + " (Dog walker)</option>");
  }
  for (var i = 0; i < owners.length; i++) {
    $('#user-selection').append(
        "<option value='o" + owners[i].id + "'>" + owners[i].name + " (Dog owner)</option>");
  }
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
          getData();
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
        getData(function() {
          updateRequests(currentUserId);
        });
      })
    });

    reject.click(function() {
      var row = $(this).closest('tr');
      $.post('/delete/request', {
        'id': row.attr('id')
      }, function() {
        getData(function() {
          updateRequests(currentUserId);
        });
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
    updateUserSelection();
    if (callback) {
      callback();
    }
  });
}

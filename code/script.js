var owners = ["Joe", "Seb", "Ken"];
var walkers = ['Danny "Dog" Doe', 'Ronny "Run" Rooney', 'Freddy "Food" Frederick'];
var requests = [
  { owner: 0, walker: 3, date: '1/1/1901 - 2pm' },
  { owner: 1, walker: 2, date: '11/11/1911 - 3am' },
  { owner: 2, walker: 1, date: '5/16/2016 - 5pm' },
];
var sections = ["signup", "owner-request", "walker-requests"];

$(document).ready(function() {
  updateWalkerSelection();
  updateRequests();
  showSectionOnly("signup");

  $('#home').click($.proxy(showSectionOnly, null, "signup"));

  $('#signup-button').click(function() {
    var name = $('#name').val().trim();
    var isOwner = $('#owner').is(':checked');
    var isWalker = $('#walker').is(':checked');

    if (name.length == 0 || !isOwner && !isWalker) {
      alert("Bad or missing input");
    } else {
      // Reset form elements.
      $('#name').val('');
      $('#owner').removeAttr('checked');
      $('#walker').removeAttr('checked');

      if (isOwner) {
        owners.push(name);
      } else {
        walkers.push(name);
      }

      updateWalkerSelection();
      var nextSection = isOwner ? "owner-request" : "walker-requests";
      showSectionOnly(nextSection);
    }
  });

  $('#request').click(function() {
    var date = $('#date').val().trim();
    var walker = $('#walker-selection').val();
    if (date.length == 0) {
      alert("Bad or missing input");
    } else {
      // Reset form elements.
      $('#date').val('');
      $('#walker-selection').val(0);

      // Assume the last added owner is the current owner.
      var owner = owners.length - 1;
      requests.push({ owner: owner, walker: walker, date: date });
      updateRequests();
    }
  });

});

function showSectionOnly(section) {
  console.log('show section only:' + section);
  var hiddenClass = 'hidden';
  for (var i = 0; i < sections.length; i++) {
    var tag = $('#' + sections[i]);
    if (section == sections[i]) {
      tag.removeClass(hiddenClass);
    } else {
      tag.addClass(hiddenClass);
    }
  }
}

function updateWalkerSelection() {
  $('#walker-selection').empty(); // Clear all options first.

  for (var i = 0; i < walkers.length; i++) {
    $('#walker-selection').append(
        "<option value='" + i + "'>" + walkers[i] + "</option>");
  }
}

function updateRequests() {
  $('#requests').empty(); // Clear the table first, then add the header.
  $('#requests').append("<tr><th>Dog owner</th><th>Date</th><th>Accept?</th></tr>");

  for (var i = 0; i < requests.length; i++) {
    var request = requests[i];
    var name = $('<td>').text(owners[request.owner]);
    var date = $('<td>').text(request.date);
    var accept = $('<button>').addClass('btn btn-primary').text('Accept');
    var reject = $('<button>').addClass('btn btn-primary').text('Reject');
    var row = $('<tr>').append(name, date, $('<td>').append(accept, reject));

    accept.click(function() {
      var row = $(this).closest('tr');
      requests.splice(row[0].rowIndex - 1, 1);
      row.remove();
    });

    reject.click(function() {
      var row = $(this).closest('tr');
      requests.splice(row[0].rowIndex - 1, 1);
      row.remove();
    });

    $('#requests').append(row);
  }
}

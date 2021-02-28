class App {
  constructor() {
    this.createTemplates();
    this.getContacts();
    this.bindEvents();
  }
  getContacts() {
    let self = this;
    ContactsAPI.get().done(function (data) {
      self.contacts = data;
      self.renderContacts();
      console.log('test')
      self.renderTags()
    }).fail(function (error) {
      alert('Cannot Get contacts');
    })
    // return contacts
  }

  bindEvents() {
    $('.add-contact').on('click', this.addContactForm.bind(this));
    $('#contacts').delegate('.delete-button', 'click', this.deleteCurrentContact.bind(this));
    $('#new-contact').delegate('.cancel-button', 'click', this.toggleForm.bind(this));
    $('#new-contact form').submit(this.addContact.bind(this));
    $('#contacts').delegate('.edit-button', 'click', this.toggleEditMode.bind(this));
    $('#contacts').delegate('.update-button', 'click', this.updateUser.bind(this));
    $('#search').keyup(this.filterNames.bind(this));
    $('#start-button').click(this.toggleStartApp.bind(this));
    $('body').delegate('.tag', 'click', this.toggleTagSelector.bind(this));
  }

  renderTags() {
    let list = document.querySelectorAll('span.tags');
    let self = this;
    [...list].forEach(tag => {
      if (tag.innerText === '') return;
      let tags = tag.innerText.split(',').map(word => {
        return { tag: word }
      });
      $(tag).replaceWith(this.templates.makeTags({ tags }));
    }) 
  }
  filterNames(event) {
    let text = event.currentTarget.value;
    if (text.length === 0) {
      this.filtered = false;
    } else {
      this.filtered = true;
    }
    let lis = [...document.querySelectorAll('#contacts ul li')].filter(li => {
      return $(li).attr('data-name').toLowerCase().startsWith(text.toLowerCase()) && li.style.display === 'none';
    });

    let others = [...document.querySelectorAll('#contacts ul li')].filter(li => {
      return !$(li).attr('data-name').toLowerCase().startsWith(text.toLowerCase()) && li.style.display !== 'none';
    });
    if (this.tagged) {
      lis = [...lis].filter(li => $(li).css('display') !== 'none');
      others = [...others].filter(li => $(li).css('display') === 'inline-block');
    }
    
    $(others).slideToggle(400);
    lis.forEach(li => { $(li).slideToggle(400) });
    this.renderSelected();
  }

  toggleTagSelector(event) {
    event.preventDefault()
    let tag = $(event.target).closest('div')[0]
    let tags = document.querySelector('#all-tags');
    // if (tags.querySelector(`div[data-name=${$(tag).attr('data-name')}]`)) {
    //   alert(tag)
    // }
    tag = tag.cloneNode(true);
    let text = tag.innerText.trim()
    let current = tags.querySelector(`div[data-name=${text}]`)
    if (current) {
      $(current).slideToggle(300, function () {
        current.remove(); 
      })
      // console.log('worked')
    } else {
      $('#all-tags').append(tag)
    }
    this.renderSelected();
  }

  renderSelected() {
    let tags = [...document.querySelectorAll('#all-tags .tag')].map(tag => tag.innerText)
    if (tags.length > 0) {
      this.tagged = true;
    } else {
      this.tagged = false;
    }
    let contacts = document.querySelectorAll('.contact');
    if (this.filtered) contacts = [...contacts].filter(contact => $(contact).css('display') !== 'none');
    contacts.forEach(contact => {
      let state = true;
      let myTags = [...contact.querySelectorAll('.tag')].map(tag => tag.innerText)
      tags.forEach(one => {
        if (!myTags.join('').includes(one)) {
          state = false;
        }
      })
      if (!state) {
        $(contact).css({ display: 'none' })
      } else {
        $(contact).css({ display: '' })
      }
    })
  }

  tagsToString($list) {
    
  }
  toggleStartApp(event) {
    $('main').slideToggle(400);
    $('footer').slideToggle(400);
    let target = event.target;
    let self = this;
    $(target).fadeOut(150)
    target.innerText = this.started ? 'Re-open the app' : 'Close App';
    $(target).fadeIn(350, function () {
      this.classList.toggle('started')
    })

    this.started = this.started ? false : true;
  }
  updateUser(event) {
    event.preventDefault()
    let $li = $(event.target).closest('li')
    let self = this;
    self.currentId = $li.attr('data-id');
    let data = {
      id: self.currentId,
      full_name: $li.find('input.full_name').val(),
      email: $li.find('input.email').val(),
      phone_number: $li.find('input.phone_number').val(),
      tags: self.format($li.find('input.tags').val()),
    }
    ContactsAPI.update(self.currentId, data).done(function (data) {
      alert('success');
      self.toggleEditMode(event)
      let newLi = document.createElement('li')
      newLi.classList.add('contact')
      let html = self.templates.single_contact(data) // <li> data </li>
      // $(newLi).html(html) // <li>da<li>data</li>ta</li>
      $li.replaceWith(html)
      self.renderTags();
    }).fail(function () {
      alert('failed ');
    })
  } 
  addContactForm(event) {
    event.preventDefault();
    this.toggleForm();
  }
  toggleForm() {
    $('#contacts').slideToggle(300);
    $('#new-contact').slideToggle(300);
  }
  toggleEditMode(event) {
    if (event) event.preventDefault();
    let first;
    let second;
    let text;
    if (event.target.innerText === 'Cancel') {
      first = true;
      second = true;
      text = 'Edit';
    } else {
      text = 'Cancel';
    }
    first = first ? 'none' : 'initial';
    second = second ? 'initial' : 'none';
    let $li = $(event.target).closest('li');
    $li.toggle(300, function () {
      $li.find('.edit').css('display', first);
      $li.find('.no-edit').css({ 'display': second })
      event.target.innerText = text;
    })
    
    $li.toggle(300);
  }
  deleteCurrentContact(event) {
    event.preventDefault()
    let $person = $(event.target).closest('li');
    let confirmation = confirm('Are you sure you want to delete ' + $person.attr('data-name') + "?");
    if (!confirmation) return;
    this.currentId = $person.attr('data-id')
    this.$currentPerson = $person
    this.deletePerson()
  } 
  addContact(event) {
    let self = this;
    event.preventDefault();
    let form = $(event.target).closest('form')[0];
    let encodedString = [];
    [...form.elements].forEach(element => {
      let key = element.name;
      let value = element.value;
      if(key === 'tags' && value) value = self.format(value)
      if(value) encodedString.push(`${encodeURIComponent(`${key}`)}=${encodeURIComponent(`${value}`)}`)
    })

    encodedString = encodedString.join('&')
    // takes a form, data and content type to send a post request and returns jquery
    ContactsAPI.postForm(form, encodedString, 'application/x-www-form-urlencoded')
      .done(function (data) {
        form.reset();
        let html = self.templates.single_contact(data);
        $('#contacts ul')[0].insertAdjacentHTML('beforeend', html);
        self.toggleForm();
      }).fail(function () {
        alert('unable to post a new contact');
      });

  }
  format(tags) {
    return tags.replace(/\s+/gi, ',');
  }
  createTemplates() {
    let self = this;
    self.templates = {};
    document.querySelectorAll("script[type='text/x-handlebars']").forEach(tmpl => {
      self.templates[tmpl["id"]] = Handlebars.compile(tmpl["innerHTML"]);
    });
    document.querySelectorAll("[data-type=partial]").forEach(template => {
      Handlebars.registerPartial(template["id"], template["innerHTML"]);
    });
  }

  deletePerson() {
    let self = this;
    ContactsAPI.delete(self.currentId).done(function () {
        self.$currentPerson.slideToggle(300, function () {
        this.remove()
        });
    }).fail(function () {
      alert('cannot find this person');
    })
  }
  renderContacts() {
    let contacts = this.contacts
    // contacts.forEach(contact => contact.tags = self.renderTags(contact.tags))
    $('#contacts').html(this.templates.contactsTemplate({ contacts }))
    // this.renderTags()
  }
}
$(function () {
  let app = new App
})

// GET, POST, PUT, DELETE
// Get -> 
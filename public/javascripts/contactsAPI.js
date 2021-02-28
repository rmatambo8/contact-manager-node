class ContactsAPI {
  // get the contacts from the server
  static get() {
    return $.ajax({
      url:"/api/contacts"
    })
  }
  // make a put request to a url based on ID.
  static update(id, data) {
    return $.ajax({
      type: 'PUT',
      url: 'api/contacts/' + id,
      data
    })
  }
  
  // takes a form, data and content type to send a post request and returns jquery
  static postForm(form, data, contentType) {
    return $.ajax({
      url: form.action,
      type:"POST",
      data,
      contentType,
      dataType: "json",
    })
  }
  static delete(id) {
    return $.ajax({
      type: 'DELETE',
      url: '/api/contacts/' + id,      
    })
  }
}
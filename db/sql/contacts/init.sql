INSERT INTO contacts (info) VALUES
('{
    "tags": "work,friend",
    "email": "nf@example.com",
    "full_name": "Naveed Fida",
    "phone_number": "12345678901"
  }'),
('{
  "tags": "work,friend",
  "email": "vpr@example.com",
  "full_name": "Victor Reyes",
  "phone_number": "09876543210"
}'),
('{
  "tags": "",
  "email": "ph@example.com",
  "full_name": "Pete Hanson",
  "phone_number": "54321098761"
}')   -- contact 3;
RETURNING id
function makeBookmarksArray() {
  return [
    {
      id: 1,
      title: 'Google',
      website_url: 'http://google.com',
      website_description: 'Lorem ipsum dolor sit amet',
      rating: '4',
    },
    {
      id: 2,
      title: 'ThatGoogle',
      website_url: 'http://thatgoogle.com',
      website_description:
        'Lorem ipsum dolor sit amet consectetur.',
      rating: '5',
    },
    {
      id: 3,
      title: 'NotGoogle',
      website_url: 'http://notgoogle.com',
      website_description:
        'Lorem ipsum dolor sit amet, consectetur.',
      rating: '3',
    },
    {
      id: 4,
      title: 'AlsoGoogle',
      website_url: 'http://alsogoogle.com',
      website_description: 'Lorem ipsum dolor',
      rating: '2',
    },
  ];
}

module.exports = {
  makeBookmarksArray,
};

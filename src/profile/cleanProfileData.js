const logger = require('../logger')(__filename)
const pkg = require('../package')

module.exports = (profile) => {
  profile.profile = profile.profileLegacy
  if(!profile.profile){
    profile.profile = profile.profileAlternative
  }

  if(!profile.profile) {
    const messageError = `LinkedIn website changed and ${pkg.name} ${pkg.version} can't read basic data. Please report this issue at ${pkg.bugs.url}`
    logger.error(messageError, '')
    throw new Error(messageError)
  }

  if(profile.profile.connections) {
    profile.profile.connections = profile.profile.connections.replace(' connections', '')

    if(profile.profile.connections.indexOf('followers') > -1){
      profile.profile.followers = profile.profile.connections
                                                  .replace(' followers', '')
                                                  .replace(',', '')
    }
  }

  //backward compatibility only
  if(profile.aboutLegacy && profile.aboutLegacy.text) {
    profile.profile.summary = profile.aboutLegacy.text
  }
  if(profile.aboutAlternative && profile.aboutAlternative.text) {
    profile.profile.summary = profile.aboutAlternative.text
  }

  profile.positions.forEach((position) => {
    if(position.title){
        position.title = position.title.replace('Company Name\n', '')
    }
    if(position.description) {
      position.description = position.description.replace('See more', '');
      position.description = position.description.replace('see more', '');
	    position.description = position.description.replace('See less', '');
    }
    if(position.roles) {
      position.roles.forEach((role) => {
        if(role.title) {
          role.title = role.title.replace('Title\n', '')
        }
        if(role.description) {
          role.description = role.description.replace('See more', '')
          role.description = role.description.replace('see more', '')
        }
      })
    }
  })

  if(profile.recommendations.receivedCount) {
    profile.recommendations.receivedCount = profile.recommendations.receivedCount.replace(/[^\d]/g, '')
  }

  if(profile.recommendations.givenCount) {
    profile.recommendations.givenCount = profile.recommendations.givenCount.replace(/[^\d]/g, '')
  }

  if(profile.recommendations.received) {
    profile.recommendations.received.forEach((recommendation) => {
      if(recommendation.summary){
        recommendation.summary = recommendation.summary.replace('See more', '')
        recommendation.summary = recommendation.summary.replace('See less', '')
      }
    })
  }

  if(profile.recommendations.given) {
    profile.recommendations.given.forEach((recommendation) => {
      if(recommendation.summary){
        recommendation.summary = recommendation.summary.replace('See more', '')
        recommendation.summary = recommendation.summary.replace('See less', '')
      }
    })
  }

  if(profile.courses){
    profile.courses = profile.courses.map(({ name, year }) => {
      const coursesObj = {}
      if(name) {
        coursesObj.name = name.replace('Course name\n', '')
      }
      if(year) {
        coursesObj.year = year.replace('Course number\n', '')
      }
      return coursesObj
    }
    );
  }

  if(profile.languages){
    profile.languages = profile.languages.map(({ name, proficiency }) => ({
      name: name ? name.replace('Language name\n', '') : undefined,
      proficiency,
    }));
  }

  if(profile.projects){
    profile.projects = profile.projects.map(
      ({ name, date, description, link }) => ({
        name: name ? name.replace('Project name\n', '') : undefined,
        date,
        description: description ? description.replace('Project description\n', '') : undefined,
        link,
      }),
    );
  }

  if (profile.certifications) {
    profile.certifications = profile.certifications.map((certification) => {
      if (certification.receivedDate) {
        if (certification.receivedDate.startsWith('Issued ')) {
          const receivedDate = certification.receivedDate
            .replace(certification.expirationDate, '')
            .replace(/Issued /, '');

          // format if month and year, or only year given
          const formattedReceivedDate =
            receivedDate.split(' ').length > 1
              ? `1 ${receivedDate}`
              : receivedDate;

          const formattedDate = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(new Date(formattedReceivedDate));

          certification.receivedDate = formattedDate;
        } else {
          // In case of no issued date in the section
          delete certification.receivedDate;
        }
      }
      return certification;
    });
  }

  return profile;
};

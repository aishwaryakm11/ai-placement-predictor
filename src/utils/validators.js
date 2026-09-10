/**
 * Client-side validators for student profile input dimensions
 * per technical specification requirements.
 */

export function validateProfile(data) {
  const errors = {};

  // Department
  if (!data.department || typeof data.department !== 'string' || !data.department.trim()) {
    errors.department = 'Department is required';
  }

  // Semester (1 - 8)
  const semester = Number(data.semester);
  if (isNaN(semester) || semester < 1 || semester > 8) {
    errors.semester = 'Semester must be between 1 and 8';
  }

  // CGPA (0.0 - 10.0)
  const cgpa = Number(data.cgpa);
  if (isNaN(cgpa) || cgpa < 0.0 || cgpa > 10.0) {
    errors.cgpa = 'CGPA must be between 0.00 and 10.00';
  }

  // 10th Percentage (0.0 - 100.0)
  const tenth = Number(data.tenth_percentage);
  if (isNaN(tenth) || tenth < 0.0 || tenth > 100.0) {
    errors.tenth_percentage = '10th % must be between 0 and 100';
  }

  // 12th Percentage (0.0 - 100.0)
  const twelfth = Number(data.twelfth_percentage);
  if (isNaN(twelfth) || twelfth < 0.0 || twelfth > 100.0) {
    errors.twelfth_percentage = '12th % must be between 0 and 100';
  }

  // Backlogs (>= 0)
  const backlogs = Number(data.backlogs);
  if (isNaN(backlogs) || backlogs < 0) {
    errors.backlogs = 'Backlogs cannot be negative';
  }

  // Known Languages (multi-select, >= 1)
  if (!Array.isArray(data.known_languages) || data.known_languages.length === 0) {
    errors.known_languages = 'Select at least one programming language';
  }

  // Projects Count (>= 0)
  const projects = Number(data.projects_count);
  if (isNaN(projects) || projects < 0) {
    errors.projects_count = 'Projects count must be 0 or higher';
  }

  // Internships Count (>= 0)
  const internships = Number(data.internships_count);
  if (isNaN(internships) || internships < 0) {
    errors.internships_count = 'Internships count must be 0 or higher';
  }

  // Open Source Contributions (>= 0)
  const openSource = Number(data.open_source_contributions);
  if (isNaN(openSource) || openSource < 0) {
    errors.open_source_contributions = 'Open source count must be 0 or higher';
  }

  // Aptitude Score (0 - 100)
  const aptitude = Number(data.aptitude_score);
  if (isNaN(aptitude) || aptitude < 0.0 || aptitude > 100.0) {
    errors.aptitude_score = 'Aptitude score must be between 0 and 100';
  }

  // Soft Skill Rating (1.0 - 5.0)
  const softSkill = Number(data.soft_skill_rating);
  if (isNaN(softSkill) || softSkill < 1.0 || softSkill > 5.0) {
    errors.soft_skill_rating = 'Soft skill rating must be between 1.0 and 5.0';
  }

  // Hackathons Attended (>= 0)
  const hackathons = Number(data.hackathons_attended);
  if (isNaN(hackathons) || hackathons < 0) {
    errors.hackathons_attended = 'Hackathons count must be 0 or higher';
  }

  // Leadership Roles (>= 0)
  const leadership = Number(data.leadership_roles);
  if (isNaN(leadership) || leadership < 0) {
    errors.leadership_roles = 'Leadership roles must be 0 or higher';
  }

  // Target Role
  if (!data.target_role || typeof data.target_role !== 'string' || !data.target_role.trim()) {
    errors.target_role = 'Please select a target role';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

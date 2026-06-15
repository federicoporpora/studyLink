import React from 'react';

const UserAvatar = ({ user, size = 32, style = {} }) => {
  const nome = user?.nome || user?.utenteNome || '?';
  const cognome = user?.cognome || '';
  
  // Extract initials
  let initials = '?';
  if (nome && nome !== '?') {
    const parts = [nome, cognome].filter(p => p && p.trim().length > 0);
    if (parts.length >= 2) {
      initials = parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
    } else {
      const split = nome.split(' ').filter(p => p && p.trim().length > 0);
      if (split.length >= 2) {
        initials = split[0].charAt(0).toUpperCase() + split[1].charAt(0).toUpperCase();
      } else {
        initials = split[0].substring(0, 2).toUpperCase();
      }
    }
  }

  // Generate color
  const colors = ['#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb', '#64b5f6', '#4fc3f7', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#ff8a65', '#d4e157', '#ffd54f', '#ffb74d'];
  const fullString = (nome + ' ' + cognome).trim();
  const colorHash = fullString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
  const bgColor = colors[colorHash % colors.length];

  const profilePicUrl = user?.immagineProfilo 
    ? (user.immagineProfilo.startsWith('http') ? user.immagineProfilo : `${import.meta.env.VITE_API_URL || ''}${user.immagineProfilo}`) 
    : null;

  return (
    <div style={{ 
      width: size, 
      height: size, 
      borderRadius: '50%', 
      backgroundColor: profilePicUrl ? '#ccc' : bgColor, 
      overflow: 'hidden', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      flexShrink: 0,
      ...style 
    }}>
      {profilePicUrl ? (
        <img src={profilePicUrl} alt={nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontSize: size * 0.45, color: '#fff', fontWeight: 'bold' }}>{initials}</span>
      )}
    </div>
  );
};

export default UserAvatar;

export interface ScheduleItem {
  hora: string;
  obs: string;
}

export interface BusLine {
  id: number;
  numero: string;
  nome: string;
  via: string;
  cor: string;
  directions: string[];
  horarios: {
    uteis: Record<string, ScheduleItem[]>;
    sabados: Record<string, ScheduleItem[]>;
    domingos: Record<string, ScheduleItem[]>;
  };
}

export const busLines: BusLine[] = [
  {
    id: 1,
    numero: '01',
    nome: 'Jardim Paraíso / N.Sra. Aparecida',
    via: 'Via Novo Horizonte',
    cor: '#e74c3c',
    directions: ['Jardim Paraíso', 'Jardim Europa II'],
    horarios: {
      uteis: {
        'Jardim Paraíso': [
          { hora: '05:40', obs: '' },
          { hora: '06:20', obs: 'Via Vila Resende/Polivalente' },
          { hora: '07:00', obs: 'Via Polivalente' },
          { hora: '07:50', obs: '' },
          { hora: '08:30', obs: '' },
          { hora: '09:25', obs: '' },
          { hora: '10:05', obs: '' },
          { hora: '10:55', obs: '' },
          { hora: '11:30', obs: 'Via Polivalente' },
          { hora: '12:20', obs: '' },
          { hora: '13:05', obs: '' },
          { hora: '13:55', obs: '' },
          { hora: '14:35', obs: '' },
          { hora: '15:25', obs: '' },
          { hora: '16:10', obs: '' },
          { hora: '16:55', obs: '' },
          { hora: '17:45', obs: '' },
          { hora: '18:40', obs: '' },
          { hora: '19:10', obs: '' },
          { hora: '20:05', obs: '' },
          { hora: '20:40', obs: '' },
          { hora: '22:15', obs: 'Via Jardim América' }
        ],
        'Jardim Europa II': [
          { hora: '05:40', obs: '' },
          { hora: '06:20', obs: '' },
          { hora: '07:10', obs: 'Via Vila Resende' },
          { hora: '07:50', obs: '' },
          { hora: '08:30', obs: 'Via Vila Resende' },
          { hora: '09:20', obs: '' },
          { hora: '10:05', obs: '' },
          { hora: '10:45', obs: '' },
          { hora: '11:35', obs: 'Via Vila Resende' },
          { hora: '12:20', obs: '' },
          { hora: '13:10', obs: '' },
          { hora: '13:50', obs: '' },
          { hora: '14:40', obs: 'Via Vila Resende' },
          { hora: '15:25', obs: '' },
          { hora: '16:10', obs: 'Via Vila Resende' },
          { hora: '16:55', obs: '' },
          { hora: '17:45', obs: 'Via Vila Resende' },
          { hora: '18:30', obs: '' },
          { hora: '19:25', obs: '' },
          { hora: '19:50', obs: '' },
          { hora: '20:40', obs: '' },
          { hora: '21:15', obs: '' },
          { hora: '23:10', obs: 'Partidas Jardim América' }
        ]
      },
      sabados: {
        'Jardim Paraíso': [
          { hora: '05:40', obs: '' },
          { hora: '06:20', obs: 'Via Vila Resende/Polivalente' },
          { hora: '07:00', obs: '' },
          { hora: '07:55', obs: 'Via Polivalente' },
          { hora: '08:30', obs: '' },
          { hora: '09:25', obs: '' },
          { hora: '10:05', obs: '' },
          { hora: '10:45', obs: '' },
          { hora: '11:35', obs: '' },
          { hora: '12:20', obs: '' },
          { hora: '13:10', obs: '' },
          { hora: '14:35', obs: '' },
          { hora: '16:10', obs: '' },
          { hora: '17:45', obs: '' },
          { hora: '19:10', obs: '' },
          { hora: '20:40', obs: '' },
          { hora: '22:10', obs: 'Via Jardim América' }
        ],
        'Jardim Europa II': [
          { hora: '06:20', obs: '' },
          { hora: '07:00', obs: '' },
          { hora: '07:45', obs: '' },
          { hora: '08:30', obs: 'Via Vila Resende' },
          { hora: '09:20', obs: '' },
          { hora: '10:00', obs: 'Via Vila Resende' },
          { hora: '10:45', obs: '' },
          { hora: '11:30', obs: '' },
          { hora: '12:15', obs: '' },
          { hora: '13:00', obs: 'Via Vila Resende' },
          { hora: '13:45', obs: '' },
          { hora: '15:25', obs: '' },
          { hora: '16:55', obs: '' },
          { hora: '18:30', obs: '' },
          { hora: '19:45', obs: '' },
          { hora: '21:10', obs: '' },
          { hora: '23:10', obs: 'Partidas Jardim América' }
        ]
      },
      domingos: {
        'Jardim Paraíso': [
          { hora: '05:50', obs: '' },
          { hora: '07:00', obs: '' },
          { hora: '08:35', obs: '' },
          { hora: '10:05', obs: '' },
          { hora: '11:40', obs: '' },
          { hora: '13:10', obs: '' },
          { hora: '14:35', obs: '' },
          { hora: '16:10', obs: '' },
          { hora: '17:40', obs: '' },
          { hora: '19:10', obs: '' },
          { hora: '20:40', obs: 'Via Jardim América' },
          { hora: '22:10', obs: 'Via Jardim América' }
        ],
        'Jardim Europa II': [
          { hora: '06:20', obs: '' },
          { hora: '07:45', obs: '' },
          { hora: '09:15', obs: '' },
          { hora: '10:45', obs: '' },
          { hora: '12:15', obs: '' },
          { hora: '13:45', obs: '' },
          { hora: '15:15', obs: '' },
          { hora: '16:45', obs: '' },
          { hora: '18:15', obs: '' },
          { hora: '19:45', obs: '' },
          { hora: '21:25', obs: 'Partidas Jardim América' },
          { hora: '23:10', obs: 'Partidas Jardim América' }
        ]
      }
    }
  },
  {
    id: 2,
    numero: '02',
    nome: 'Parque Jussara / Boa Ventura',
    via: 'Via Alterosa',
    cor: '#3498db',
    directions: ['Parque Jussara', 'Boa Ventura', 'Belo Horizonte'],
    horarios: {
      uteis: {
        'Parque Jussara': [
          { hora: '05:40', obs: '' },
          { hora: '06:15', obs: 'Via Colônia Santa Fé' },
          { hora: '06:45', obs: 'Via Tapera' },
          { hora: '07:10', obs: 'Via Colônia Santa Fé' },
          { hora: '07:45', obs: '' },
          { hora: '08:15', obs: '' },
          { hora: '08:45', obs: '' },
          { hora: '09:15', obs: '' },
          { hora: '09:45', obs: '' },
          { hora: '10:15', obs: '' },
          { hora: '10:45', obs: '' },
          { hora: '11:10', obs: 'Via Tapera' },
          { hora: '11:50', obs: 'Via Tapera' },
          { hora: '12:20', obs: 'Via Tapera' },
          { hora: '12:50', obs: 'Via Tapera' },
          { hora: '13:30', obs: 'Via Tapera' },
          { hora: '14:00', obs: '' },
          { hora: '14:30', obs: '' },
          { hora: '15:10', obs: '' },
          { hora: '15:40', obs: '' },
          { hora: '16:10', obs: '' },
          { hora: '16:50', obs: 'Via Tapera' },
          { hora: '17:20', obs: '' },
          { hora: '17:50', obs: '' },
          { hora: '18:30', obs: 'Via Tapera' },
          { hora: '19:00', obs: 'Via Tapera' },
          { hora: '19:30', obs: '' },
          { hora: '20:10', obs: 'Via Tapera' },
          { hora: '21:00', obs: 'Via Tapera' },
          { hora: '21:40', obs: 'Via Tapera' },
          { hora: '22:20', obs: 'Via Tapera' },
          { hora: '23:05', obs: 'Via Tapera' }
        ],
        'Boa Ventura': [
          { hora: '05:50', obs: 'Via Tapera' },
          { hora: '06:20', obs: 'Via Tapera' },
          { hora: '07:00', obs: '' },
          { hora: '07:30', obs: 'Via Tapera' },
          { hora: '08:00', obs: 'Via Tapera' },
          { hora: '08:30', obs: 'Via Tapera' },
          { hora: '09:00', obs: '' },
          { hora: '09:30', obs: '' },
          { hora: '10:00', obs: '' },
          { hora: '10:30', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '11:30', obs: 'Via Tapera' },
          { hora: '12:00', obs: 'Via Tapera' },
          { hora: '12:40', obs: 'Via Tapera' },
          { hora: '13:10', obs: '' },
          { hora: '13:40', obs: '' },
          { hora: '14:20', obs: '' },
          { hora: '14:50', obs: '' },
          { hora: '15:20', obs: '' },
          { hora: '16:00', obs: '' },
          { hora: '16:30', obs: '' },
          { hora: '17:00', obs: '' },
          { hora: '17:40', obs: '' },
          { hora: '18:10', obs: '' },
          { hora: '18:40', obs: 'Via Tapera' },
          { hora: '19:20', obs: '' },
          { hora: '20:20', obs: '' },
          { hora: '21:00', obs: '' },
          { hora: '21:40', obs: '' },
          { hora: '22:20', obs: '' },
          { hora: '23:05', obs: '' }
        ],
        'Belo Horizonte': [
          { hora: '05:45', obs: '' },
          { hora: '06:10', obs: '' },
          { hora: '07:25', obs: '' },
          { hora: '08:00', obs: '' },
          { hora: '08:15', obs: '' },
          { hora: '08:50', obs: '' },
          { hora: '09:15', obs: '' },
          { hora: '09:45', obs: '' },
          { hora: '10:15', obs: '' },
          { hora: '10:45', obs: '' },
          { hora: '11:15', obs: '' },
          { hora: '11:45', obs: '' },
          { hora: '12:25', obs: '' },
          { hora: '12:55', obs: '' },
          { hora: '13:25', obs: '' },
          { hora: '14:05', obs: '' },
          { hora: '14:25', obs: '' },
          { hora: '15:05', obs: '' },
          { hora: '15:45', obs: '' },
          { hora: '16:15', obs: '' },
          { hora: '16:45', obs: '' },
          { hora: '17:25', obs: '' },
          { hora: '17:55', obs: '' },
          { hora: '18:25', obs: '' },
          { hora: '19:05', obs: '' },
          { hora: '20:05', obs: '' },
          { hora: '20:45', obs: '' },
          { hora: '21:25', obs: '' },
          { hora: '22:05', obs: '' },
          { hora: '22:50', obs: '' }
        ]
      },
      sabados: {
        'Parque Jussara': [
          { hora: '06:15', obs: 'Via Colônia Santa Fé' },
          { hora: '06:45', obs: 'Via Tapera' },
          { hora: '07:15', obs: 'Via Tapera' },
          { hora: '07:45', obs: 'Via Tapera' },
          { hora: '08:15', obs: '' },
          { hora: '08:45', obs: '' },
          { hora: '09:15', obs: '' },
          { hora: '09:45', obs: '' },
          { hora: '10:15', obs: '' },
          { hora: '10:45', obs: '' },
          { hora: '11:15', obs: 'Via Tapera' },
          { hora: '11:45', obs: 'Via Tapera' },
          { hora: '12:15', obs: 'Via Colônia Santa Fé' },
          { hora: '12:45', obs: 'Via Tapera' },
          { hora: '13:15', obs: 'Via Tapera' },
          { hora: '14:00', obs: '' },
          { hora: '14:45', obs: '' },
          { hora: '15:30', obs: 'Via Colônia Santa Fé' },
          { hora: '16:15', obs: '' },
          { hora: '17:00', obs: '' },
          { hora: '18:00', obs: 'Via Colônia Santa Fé' },
          { hora: '19:00', obs: '' },
          { hora: '20:00', obs: 'Via Tapera' },
          { hora: '21:00', obs: 'Via Tapera' },
          { hora: '22:00', obs: 'Via Tapera' },
          { hora: '23:00', obs: 'Via Tapera' }
        ],
        'Boa Ventura': [
          { hora: '06:00', obs: 'Via Tapera' },
          { hora: '06:30', obs: 'Via Tapera' },
          { hora: '07:00', obs: 'Via Tapera' },
          { hora: '07:30', obs: 'Via Tapera' },
          { hora: '08:00', obs: 'Via Tapera' },
          { hora: '08:30', obs: '' },
          { hora: '09:00', obs: '' },
          { hora: '09:30', obs: '' },
          { hora: '10:00', obs: 'Via Tapera' },
          { hora: '10:30', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '11:30', obs: '' },
          { hora: '12:00', obs: 'Via Tapera' },
          { hora: '12:30', obs: 'Via Tapera' },
          { hora: '13:10', obs: '' },
          { hora: '13:30', obs: 'Via Tapera' },
          { hora: '14:00', obs: '' },
          { hora: '14:45', obs: '' },
          { hora: '15:30', obs: '' },
          { hora: '16:15', obs: '' },
          { hora: '17:00', obs: '' },
          { hora: '18:00', obs: '' },
          { hora: '19:00', obs: 'Via Colônia/Tapera' },
          { hora: '20:00', obs: '' },
          { hora: '21:00', obs: '' },
          { hora: '22:00', obs: '' },
          { hora: '22:40', obs: '' },
          { hora: '23:00', obs: '' }
        ],
        'Belo Horizonte': [
          { hora: '05:55', obs: '' },
          { hora: '06:15', obs: '' },
          { hora: '07:15', obs: '' },
          { hora: '07:45', obs: '' },
          { hora: '08:15', obs: '' },
          { hora: '08:45', obs: '' },
          { hora: '09:15', obs: '' },
          { hora: '09:45', obs: '' },
          { hora: '10:15', obs: '' },
          { hora: '10:45', obs: '' },
          { hora: '11:15', obs: '' },
          { hora: '11:45', obs: '' },
          { hora: '12:15', obs: '' },
          { hora: '12:45', obs: '' },
          { hora: '13:05', obs: '' },
          { hora: '13:45', obs: '' },
          { hora: '14:30', obs: '' },
          { hora: '15:15', obs: '' },
          { hora: '16:00', obs: '' },
          { hora: '16:45', obs: '' },
          { hora: '17:45', obs: '' },
          { hora: '18:45', obs: '' },
          { hora: '19:45', obs: '' },
          { hora: '20:45', obs: '' },
          { hora: '21:45', obs: '' },
          { hora: '22:30', obs: '' }
        ]
      },
      domingos: {
        'Parque Jussara': [
          { hora: '06:20', obs: 'Via Colônia Santa Fé' },
          { hora: '07:00', obs: 'Saída do Prol. Parque Jussara/Via Vila Bela II' },
          { hora: '08:00', obs: 'Via Tapera' },
          { hora: '09:00', obs: '' },
          { hora: '10:00', obs: 'Saída do Prol. Parque Jussara/Via Vila Bela II' },
          { hora: '11:00', obs: 'Via Tapera' },
          { hora: '12:00', obs: 'Saída do Prol. Parque Jussara/Via Vila Bela II' },
          { hora: '13:00', obs: 'Via Colônia Santa Fé' },
          { hora: '14:00', obs: 'Saída do Prol. Parque Jussara/Via Vila Bela II' },
          { hora: '15:00', obs: '' },
          { hora: '16:00', obs: '' },
          { hora: '17:00', obs: 'Via Colônia Santa Fé' },
          { hora: '18:00', obs: 'Via Colônia Santa Fé' },
          { hora: '19:00', obs: 'Via Tapera' },
          { hora: '20:00', obs: 'Saída do Prol. Parque Jussara/Via Vila Bela II' },
          { hora: '21:00', obs: 'Via Tapera' },
          { hora: '22:00', obs: '' },
          { hora: '22:30', obs: '' },
          { hora: '23:05', obs: '' }
        ],
        'Boa Ventura': [
          { hora: '06:20', obs: 'Via Vila Bela/Prol. Parque Jussara' },
          { hora: '07:00', obs: 'Via Tapera' },
          { hora: '08:00', obs: 'Via Prol. Parque Jussara' },
          { hora: '09:00', obs: 'Via Vila Bela/Prol. Parque Jussara' },
          { hora: '10:00', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '12:00', obs: 'Via Tapera' },
          { hora: '13:00', obs: 'Via Vila Bela/Prol. Parque Jussara' },
          { hora: '14:00', obs: '' },
          { hora: '15:00', obs: '' },
          { hora: '16:00', obs: '' },
          { hora: '17:00', obs: '' },
          { hora: '18:00', obs: '' },
          { hora: '19:00', obs: '' },
          { hora: '20:00', obs: 'Via Tapera' },
          { hora: '21:00', obs: '' },
          { hora: '22:00', obs: '' },
          { hora: '22:30', obs: '' },
          { hora: '23:05', obs: '' }
        ],
        'Belo Horizonte': [
          { hora: '06:15', obs: '' },
          { hora: '07:45', obs: '' },
          { hora: '08:50', obs: '' },
          { hora: '09:50', obs: '' },
          { hora: '10:50', obs: '' },
          { hora: '11:50', obs: '' },
          { hora: '12:50', obs: '' },
          { hora: '14:50', obs: '' },
          { hora: '15:50', obs: '' },
          { hora: '16:50', obs: '' },
          { hora: '18:50', obs: '' },
          { hora: '19:50', obs: '' },
          { hora: '20:50', obs: '' },
          { hora: '21:50', obs: '' },
          { hora: '22:30', obs: '' },
          { hora: '23:05', obs: '' }
        ]
      }
    }
  },
  {
    id: 3,
    numero: '03',
    nome: 'Jardim Paraíso / Jardim América',
    via: 'Via Bandeirantes',
    cor: '#2ecc71',
    directions: ['Jardim Paraíso', 'Jardim América'],
    horarios: {
      uteis: {
        'Jardim Paraíso': [
          { hora: '07:25', obs: 'Via Vila Resende' },
          { hora: '08:50', obs: 'Via Vila Resende' },
          { hora: '10:20', obs: 'Via Vila Resende' },
          { hora: '11:50', obs: 'Via Polivalente' },
          { hora: '12:20', obs: 'Via Jardim Europa II' },
          { hora: '13:25', obs: 'Via Vila Resende' },
          { hora: '14:55', obs: 'Via Vila Resende' },
          { hora: '16:25', obs: 'Via Vila Resende' },
          { hora: '18:05', obs: 'Via Polivalente/Jardim Europa' },
          { hora: '19:45', obs: '' },
          { hora: '21:20', obs: '' }
        ],
        'Jardim América': [
          { hora: '08:10', obs: '' },
          { hora: '09:35', obs: '' },
          { hora: '11:05', obs: 'Via Vila Resende' },
          { hora: '12:35', obs: '' },
          { hora: '14:10', obs: '' },
          { hora: '15:40', obs: '' },
          { hora: '17:10', obs: 'Via Vila Resende' },
          { hora: '19:05', obs: '' },
          { hora: '20:20', obs: '' },
          { hora: '22:10', obs: '' }
        ]
      },
      sabados: {
        'Jardim Paraíso': [
          { hora: '07:25', obs: 'Via Vila Resende' },
          { hora: '08:55', obs: 'Via Vila Resende' },
          { hora: '10:20', obs: 'Via Vila Resende' },
          { hora: '11:50', obs: 'Via Vila Resende' },
          { hora: '13:25', obs: 'Via Vila Resende' },
          { hora: '14:55', obs: 'Via Vila Resende' },
          { hora: '16:25', obs: '' }
        ],
        'Jardim América': [
          { hora: '08:05', obs: '' },
          { hora: '09:35', obs: '' },
          { hora: '11:05', obs: '' },
          { hora: '12:35', obs: '' },
          { hora: '14:10', obs: '' },
          { hora: '15:40', obs: '' },
          { hora: '17:05', obs: '' }
        ]
      },
      domingos: {}
    }
  },
  {
    id: 4,
    numero: '04',
    nome: 'Santo Afonso / Jardim América',
    via: '',
    cor: '#f39c12',
    directions: ['Santo Afonso', 'Jardim América'],
    horarios: {
      uteis: {
        'Santo Afonso': [
          { hora: '05:50', obs: 'Via CEM' },
          { hora: '06:20', obs: 'Via Polivalente/CEM' },
          { hora: '07:00', obs: 'Via Polivalente/CEM' },
          { hora: '07:40', obs: 'Via CEM' },
          { hora: '08:30', obs: 'Via CEM' },
          { hora: '09:20', obs: 'Via CEM' },
          { hora: '10:10', obs: 'Via CEM' },
          { hora: '11:00', obs: 'Via Polivalente/CEM' },
          { hora: '11:50', obs: 'Via Polivalente/CEM' },
          { hora: '12:40', obs: 'Via Polivalente/CEM' },
          { hora: '13:30', obs: 'Via CEM' },
          { hora: '14:20', obs: 'Via CEM' },
          { hora: '15:10', obs: 'Via CEM' },
          { hora: '16:00', obs: 'Via CEM' },
          { hora: '16:50', obs: 'Via CEM' },
          { hora: '17:40', obs: 'Via CEM' },
          { hora: '18:35', obs: 'Via CEM' },
          { hora: '19:20', obs: '' },
          { hora: '21:00', obs: '' }
        ],
        'Jardim América': [
          { hora: '06:20', obs: 'Via São Conrado' },
          { hora: '07:00', obs: '' },
          { hora: '07:45', obs: 'Via São Conrado' },
          { hora: '08:20', obs: '' },
          { hora: '09:20', obs: '' },
          { hora: '10:10', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '11:45', obs: 'Via Jardim Europa II' },
          { hora: '12:40', obs: '' },
          { hora: '13:30', obs: '' },
          { hora: '14:20', obs: '' },
          { hora: '15:10', obs: '' },
          { hora: '16:00', obs: '' },
          { hora: '16:50', obs: '' },
          { hora: '17:40', obs: '' },
          { hora: '18:30', obs: '' },
          { hora: '19:20', obs: '' },
          { hora: '20:10', obs: '' },
          { hora: '21:45', obs: 'Via Fernão Dias/Monte Verde' }
        ]
      },
      sabados: {
        'Santo Afonso': [
          { hora: '05:50', obs: '' },
          { hora: '06:20', obs: 'Via Polivalente' },
          { hora: '07:00', obs: '' },
          { hora: '07:40', obs: '' },
          { hora: '08:30', obs: '' },
          { hora: '09:20', obs: '' },
          { hora: '10:10', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '11:50', obs: '' },
          { hora: '12:40', obs: '' },
          { hora: '14:20', obs: '' },
          { hora: '16:00', obs: '' },
          { hora: '17:40', obs: '' },
          { hora: '19:20', obs: '' },
          { hora: '21:00', obs: '' }
        ],
        'Jardim América': [
          { hora: '06:20', obs: '' },
          { hora: '07:00', obs: '' },
          { hora: '07:45', obs: '' },
          { hora: '08:20', obs: '' },
          { hora: '09:20', obs: '' },
          { hora: '10:10', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '11:50', obs: '' },
          { hora: '12:40', obs: '' },
          { hora: '13:30', obs: '' },
          { hora: '15:10', obs: '' },
          { hora: '16:50', obs: '' },
          { hora: '18:30', obs: '' },
          { hora: '20:10', obs: '' },
          { hora: '21:45', obs: 'Via Monte Verde' }
        ]
      },
      domingos: {
        'Santo Afonso': [
          { hora: '07:30', obs: '' },
          { hora: '09:30', obs: '' },
          { hora: '11:30', obs: '' },
          { hora: '13:30', obs: '' },
          { hora: '15:30', obs: '' },
          { hora: '17:30', obs: '' },
          { hora: '19:30', obs: '' },
          { hora: '21:30', obs: '' }
        ],
        'Jardim América': [
          { hora: '06:30', obs: '' },
          { hora: '08:30', obs: '' },
          { hora: '10:30', obs: '' },
          { hora: '12:30', obs: '' },
          { hora: '14:30', obs: '' },
          { hora: '16:30', obs: '' },
          { hora: '18:30', obs: '' },
          { hora: '20:30', obs: '' },
          { hora: '22:30', obs: '' }
        ]
      }
    }
  },
  {
    id: 6,
    numero: '06',
    nome: 'Cinturão Verde / Odilon Rezende de Andrade',
    via: '',
    cor: '#9b59b6',
    directions: ['Cinturão Verde', 'Odilon Rezende de Andrade'],
    horarios: {
      uteis: {
        'Cinturão Verde': [
          { hora: '05:40', obs: '' },
          { hora: '06:20', obs: '' },
          { hora: '07:00', obs: '' },
          { hora: '07:40', obs: '' },
          { hora: '08:10', obs: 'Via Morada do Lago/Policlínica/Vila Boas' },
          { hora: '08:40', obs: '' },
          { hora: '09:15', obs: '' },
          { hora: '09:50', obs: 'Via Morada do Lago/Policlínica/Vila Boas' },
          { hora: '10:20', obs: '' },
          { hora: '10:55', obs: '' },
          { hora: '11:30', obs: 'Via Morada do Lago/Policlínica/Vila Boas' },
          { hora: '12:00', obs: '' },
          { hora: '12:35', obs: '' },
          { hora: '13:10', obs: 'Via Morada do Lago/Policlínica/Vila Boas' },
          { hora: '13:40', obs: '' },
          { hora: '14:15', obs: '' },
          { hora: '14:50', obs: 'Via Morada do Lago/Policlínica/Vila Boas' },
          { hora: '15:20', obs: '' },
          { hora: '16:30', obs: 'Via Morada do Lago/Policlínica/Vila Boas' },
          { hora: '17:00', obs: '' },
          { hora: '17:35', obs: '' },
          { hora: '18:10', obs: 'Via Morada do Lago/Policlínica/Vila Boas' },
          { hora: '18:40', obs: '' },
          { hora: '19:15', obs: '' },
          { hora: '20:20', obs: '' },
          { hora: '21:00', obs: '' },
          { hora: '21:40', obs: 'Via Mart Minas' },
          { hora: '22:20', obs: '' },
          { hora: '23:05', obs: '' }
        ],
        'Odilon Rezende de Andrade': [
          { hora: '05:40', obs: '' },
          { hora: '06:15', obs: '' },
          { hora: '07:00', obs: '' },
          { hora: '07:30', obs: 'Via Cotia/Morada do Lago' },
          { hora: '07:50', obs: '' },
          { hora: '08:25', obs: '' },
          { hora: '09:00', obs: 'Via Cotia/Morada do Lago' },
          { hora: '09:30', obs: '' },
          { hora: '10:05', obs: '' },
          { hora: '10:40', obs: 'Via Cotia/Morada do Lago' },
          { hora: '11:10', obs: '' },
          { hora: '11:45', obs: '' },
          { hora: '12:20', obs: 'Via Cotia/Morada do Lago' },
          { hora: '12:50', obs: '' },
          { hora: '13:25', obs: '' },
          { hora: '14:00', obs: 'Via Cotia/Morada do Lago' },
          { hora: '14:30', obs: '' },
          { hora: '15:05', obs: '' },
          { hora: '15:40', obs: 'Via Cotia/Morada do Lago' },
          { hora: '16:10', obs: '' },
          { hora: '16:45', obs: '' },
          { hora: '17:20', obs: 'Via Cotia/Morada do Lago' },
          { hora: '17:50', obs: '' },
          { hora: '18:25', obs: '' },
          { hora: '19:00', obs: 'Via Cotia/Morada do Lago' },
          { hora: '19:30', obs: '' },
          { hora: '20:05', obs: '' },
          { hora: '21:00', obs: '' },
          { hora: '21:40', obs: '' },
          { hora: '22:30', obs: '' },
          { hora: '23:00', obs: '' }
        ]
      },
      sabados: {
        'Cinturão Verde': [
          { hora: '05:45', obs: '' },
          { hora: '06:20', obs: '' },
          { hora: '07:00', obs: '' },
          { hora: '07:40', obs: '' },
          { hora: '08:30', obs: '' },
          { hora: '09:20', obs: '' },
          { hora: '10:10', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '11:50', obs: '' },
          { hora: '12:40', obs: '' },
          { hora: '13:30', obs: '' },
          { hora: '14:20', obs: '' },
          { hora: '15:00', obs: '' },
          { hora: '16:00', obs: '' },
          { hora: '17:00', obs: '' },
          { hora: '18:00', obs: '' },
          { hora: '19:00', obs: '' },
          { hora: '20:00', obs: '' },
          { hora: '21:00', obs: '' },
          { hora: '21:45', obs: 'Via Mart Minas/Odilon Resende/Tapera/B.Horizonte/Alterosa' },
          { hora: '23:05', obs: '' }
        ],
        'Odilon Rezende de Andrade': [
          { hora: '05:45', obs: '' },
          { hora: '06:20', obs: '' },
          { hora: '07:00', obs: '' },
          { hora: '07:40', obs: '' },
          { hora: '08:30', obs: '' },
          { hora: '09:20', obs: '' },
          { hora: '10:10', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '11:50', obs: '' },
          { hora: '12:40', obs: '' },
          { hora: '13:30', obs: '' },
          { hora: '14:20', obs: '' },
          { hora: '15:00', obs: '' },
          { hora: '16:00', obs: '' },
          { hora: '17:00', obs: '' },
          { hora: '18:00', obs: '' },
          { hora: '19:00', obs: '' },
          { hora: '20:00', obs: '' },
          { hora: '21:00', obs: '' },
          { hora: '22:00', obs: '' },
          { hora: '22:45', obs: 'Via Jardim Alterosa/Centro/Parque Jussara/Cinturão Verde' }
        ]
      },
      domingos: {
        'Cinturão Verde': [
          { hora: '06:30', obs: '' },
          { hora: '07:30', obs: '' },
          { hora: '08:30', obs: '' },
          { hora: '09:30', obs: '' },
          { hora: '10:30', obs: '' },
          { hora: '11:30', obs: '' },
          { hora: '12:30', obs: '' },
          { hora: '13:30', obs: '' },
          { hora: '14:30', obs: '' },
          { hora: '15:30', obs: '' },
          { hora: '16:30', obs: '' },
          { hora: '17:30', obs: '' },
          { hora: '18:30', obs: '' },
          { hora: '19:30', obs: '' },
          { hora: '20:30', obs: '' },
          { hora: '21:30', obs: '' },
          { hora: '22:20', obs: 'Via Parque Jussara/Santa Tereza/Centro/Monte Alegre/Vila Lima/Rio do Peixe/Boa Ventura/Odilon Resende/Tapera/Belo Horizonte/Jardim Alterosa' },
          { hora: '23:05', obs: '' }
        ],
        'Odilon Rezende de Andrade': [
          { hora: '06:30', obs: '' },
          { hora: '07:30', obs: '' },
          { hora: '08:30', obs: '' },
          { hora: '09:30', obs: '' },
          { hora: '10:30', obs: '' },
          { hora: '11:30', obs: '' },
          { hora: '12:30', obs: '' },
          { hora: '13:30', obs: '' },
          { hora: '14:30', obs: '' },
          { hora: '15:30', obs: '' },
          { hora: '16:30', obs: '' },
          { hora: '17:30', obs: '' },
          { hora: '18:30', obs: '' },
          { hora: '19:30', obs: '' },
          { hora: '20:30', obs: '' },
          { hora: '21:30', obs: '' },
          { hora: '22:20', obs: '' },
          { hora: '23:00', obs: 'Via Jardim Alterosa/Centro/Parque Jussara/Cinturão Verde' }
        ]
      }
    }
  },
  {
    id: 7,
    numero: '07',
    nome: 'Fernão Dias / Parque São José',
    via: 'Via Califórnia',
    cor: '#1abc9c',
    directions: ['Fernão Dias', 'Parque São José'],
    horarios: {
      uteis: {
        'Fernão Dias': [
          { hora: '06:30', obs: 'Via Polivalente' },
          { hora: '07:20', obs: 'Via Polivalente' },
          { hora: '08:05', obs: '' },
          { hora: '08:55', obs: '' },
          { hora: '09:45', obs: '' },
          { hora: '10:35', obs: '' },
          { hora: '11:20', obs: '' },
          { hora: '12:00', obs: '' },
          { hora: '13:05', obs: 'Via Polivalente' },
          { hora: '13:55', obs: '' },
          { hora: '14:45', obs: '' },
          { hora: '15:35', obs: '' },
          { hora: '16:25', obs: '' },
          { hora: '17:15', obs: '' },
          { hora: '18:05', obs: '' },
          { hora: '18:55', obs: '' },
          { hora: '19:45', obs: 'Via Somente até o Parque São José' },
          { hora: '21:35', obs: 'Via Somente até o Parque São José' }
        ],
        'Parque São José': [
          { hora: '06:20', obs: 'Via CEM' },
          { hora: '07:20', obs: 'Via CEM' },
          { hora: '08:05', obs: '' },
          { hora: '08:55', obs: '' },
          { hora: '09:45', obs: '' },
          { hora: '10:35', obs: '' },
          { hora: '11:15', obs: '' },
          { hora: '11:55', obs: '' },
          { hora: '13:05', obs: '' },
          { hora: '13:55', obs: '' },
          { hora: '14:45', obs: '' },
          { hora: '15:35', obs: 'Via CEM' },
          { hora: '16:25', obs: 'Via CEM' },
          { hora: '17:10', obs: '' },
          { hora: '18:05', obs: '' },
          { hora: '18:55', obs: '' },
          { hora: '19:45', obs: '' },
          { hora: '20:35', obs: '' },
          { hora: '22:25', obs: 'Via CEM' }
        ]
      },
      sabados: {
        'Fernão Dias': [
          { hora: '06:30', obs: 'Via Polivalente' },
          { hora: '07:20', obs: 'Via Polivalente' },
          { hora: '08:05', obs: '' },
          { hora: '08:55', obs: '' },
          { hora: '09:45', obs: '' },
          { hora: '10:35', obs: '' },
          { hora: '11:20', obs: '' },
          { hora: '12:05', obs: '' },
          { hora: '13:05', obs: '' },
          { hora: '14:45', obs: '' },
          { hora: '16:25', obs: '' },
          { hora: '18:05', obs: '' },
          { hora: '19:45', obs: 'Via somente até o Parque São José' }
        ],
        'Parque São José': [
          { hora: '06:20', obs: '' },
          { hora: '07:20', obs: 'Via CEM/Monte Verde' },
          { hora: '08:05', obs: '' },
          { hora: '08:55', obs: 'Via CEM/Monte Verde' },
          { hora: '09:45', obs: '' },
          { hora: '10:35', obs: 'Via Monte Verde' },
          { hora: '11:20', obs: 'Via CEM' },
          { hora: '12:05', obs: 'Via Monte Verde' },
          { hora: '13:05', obs: '' },
          { hora: '13:55', obs: '' },
          { hora: '15:35', obs: '' },
          { hora: '17:10', obs: 'Via Monte Verde' },
          { hora: '18:55', obs: 'Via Monte Verde' },
          { hora: '20:35', obs: 'Via Monte Verde' }
        ]
      },
      domingos: {
        'Fernão Dias': [
          { hora: '06:30', obs: '' },
          { hora: '08:30', obs: '' },
          { hora: '10:30', obs: '' },
          { hora: '12:30', obs: '' },
          { hora: '14:30', obs: '' },
          { hora: '16:30', obs: '' },
          { hora: '18:30', obs: '' },
          { hora: '20:30', obs: 'Via Somente até o Parque São José' },
          { hora: '22:30', obs: 'Via Somente até o Parque São José' }
        ],
        'Parque São José': [
          { hora: '07:30', obs: 'Saída Parque São José/Via Monte Verde' },
          { hora: '09:30', obs: 'Saída Parque São José/Via Monte Verde' },
          { hora: '11:30', obs: 'Saída Parque São José/Via Monte Verde' },
          { hora: '13:30', obs: 'Saída Parque São José/Via Monte Verde' },
          { hora: '15:30', obs: 'Saída Parque São José/Via Monte Verde' },
          { hora: '17:30', obs: 'Saída Parque São José/Via Monte Verde' },
          { hora: '19:30', obs: 'Saída Parque São José/Via Monte Verde' },
          { hora: '21:30', obs: 'Saída Parque São José/Via Monte Verde' },
          { hora: '23:10', obs: 'Saída Parque São José/Via Monte Verde' }
        ]
      }
    }
  },
  {
    id: 8,
    numero: '08',
    nome: 'Prolongamento Parque Jussara / Santana',
    via: 'Via São José',
    cor: '#e67e22',
    directions: ['Prol. Parque Jussara', 'Santana'],
    horarios: {
      uteis: {
        'Prol. Parque Jussara': [
          { hora: '06:05', obs: 'Via Vila Bela II' },
          { hora: '07:15', obs: 'Via Vila Bela II' },
          { hora: '08:30', obs: 'Via Vila Bela II' },
          { hora: '10:00', obs: 'Via Vila Bela II' },
          { hora: '11:30', obs: 'Via Vila Bela II' },
          { hora: '13:00', obs: 'Via Vila Bela II' },
          { hora: '14:30', obs: 'Via Vila Bela II' },
          { hora: '16:00', obs: 'Via Vila Bela II' },
          { hora: '17:40', obs: 'Via Vila Bela II' },
          { hora: '19:05', obs: 'Via Vila Bela II' }
        ],
        'Santana': [
          { hora: '05:35', obs: 'Via Brigadeiro' },
          { hora: '06:35', obs: 'Via Brigadeiro' },
          { hora: '07:50', obs: 'Via Brigadeiro' },
          { hora: '09:15', obs: 'Via Brigadeiro' },
          { hora: '10:45', obs: 'Via Vila Bela II' },
          { hora: '12:10', obs: 'Via Vila Bela II' },
          { hora: '13:45', obs: 'Via Vila Bela II' },
          { hora: '15:15', obs: 'Via Jardim das Hortências/Vila Bela II' },
          { hora: '16:45', obs: 'Via Vila Bela II' },
          { hora: '18:15', obs: 'Via Vila Bela II' },
          { hora: '19:35', obs: 'Via Vila Bela II' }
        ]
      },
      sabados: {
        'Prol. Parque Jussara': [
          { hora: '06:05', obs: 'Via Vila Bela II' },
          { hora: '07:15', obs: 'Via Vila Bela II' },
          { hora: '08:30', obs: 'Via Vila Bela II' },
          { hora: '10:00', obs: 'Via Vila Bela II' },
          { hora: '11:30', obs: 'Via Vila Bela II' },
          { hora: '13:00', obs: 'Via Vila Bela II' },
          { hora: '14:30', obs: 'Via Vila Bela II' },
          { hora: '16:00', obs: 'Via Vila Bela II' },
          { hora: '17:40', obs: 'Via Vila Bela II' },
          { hora: '19:05', obs: 'Via Vila Bela II' }
        ],
        'Santana': [
          { hora: '05:30', obs: 'Via Jd.das Hortências/Bandeirantes/Brigadeiro' },
          { hora: '06:35', obs: 'Via Jd.das Hortências/Brigadeiro' },
          { hora: '07:50', obs: 'Via Jd.das Hortências/Brigadeiro' },
          { hora: '09:15', obs: 'Via Jd.das Hortências/Brigadeiro' },
          { hora: '10:45', obs: 'Via Jd.das Hortências/Vila Bela II' },
          { hora: '12:10', obs: 'Via Jd.das Hortências/Vila Bela II' },
          { hora: '13:45', obs: 'Via Jd.das Hortências/Vila Bela II' },
          { hora: '15:15', obs: 'Via Jd.das Hortências/Vila Bela II' },
          { hora: '16:45', obs: 'Via Jd.das Hortências/Vila Bela II' },
          { hora: '18:15', obs: 'Via Jd.das Hortências/Vila Bela II' },
          { hora: '19:35', obs: 'Via Jd.das Hortências/Vila Bela II' }
        ]
      },
      domingos: {}
    }
  },
  {
    id: 9,
    numero: '09',
    nome: 'Centro / Amadeu Miguel',
    via: '',
    cor: '#34495e',
    directions: ['Centro', 'Amadeu Miguel'],
    horarios: {
      uteis: {
        'Centro': [
          { hora: '05:15', obs: 'Saída Jardim Paraíso' },
          { hora: '06:10', obs: 'Saída Jardim Paraíso' },
          { hora: '07:00', obs: '' },
          { hora: '07:45', obs: '' },
          { hora: '08:25', obs: '' },
          { hora: '09:10', obs: '' },
          { hora: '10:20', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '11:40', obs: '' },
          { hora: '12:25', obs: '' },
          { hora: '13:00', obs: '' },
          { hora: '14:20', obs: '' },
          { hora: '15:40', obs: '' },
          { hora: '16:20', obs: '' },
          { hora: '17:00', obs: '' },
          { hora: '17:50', obs: '' },
          { hora: '18:40', obs: '' }
        ],
        'Amadeu Miguel': [
          { hora: '06:20', obs: '' },
          { hora: '07:05', obs: '' },
          { hora: '07:45', obs: '' },
          { hora: '08:30', obs: '' },
          { hora: '09:10', obs: '' },
          { hora: '09:45', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '11:40', obs: '' },
          { hora: '12:20', obs: '' },
          { hora: '13:05', obs: '' },
          { hora: '13:40', obs: '' },
          { hora: '15:00', obs: '' },
          { hora: '16:20', obs: '' },
          { hora: '17:00', obs: '' },
          { hora: '17:40', obs: 'Via Carmo Coffe' },
          { hora: '18:30', obs: '' },
          { hora: '19:20', obs: '' }
        ]
      },
      sabados: {
        'Centro': [
          { hora: '05:15', obs: 'Saída Jardim Paraíso' },
          { hora: '06:10', obs: 'Saída Jardim Paraíso' },
          { hora: '07:00', obs: '' },
          { hora: '07:45', obs: '' },
          { hora: '08:20', obs: '' },
          { hora: '09:05', obs: '' },
          { hora: '10:20', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '11:40', obs: '' },
          { hora: '12:25', obs: '' },
          { hora: '13:00', obs: '' },
          { hora: '14:30', obs: '' },
          { hora: '16:30', obs: '' },
          { hora: '18:30', obs: '' }
        ],
        'Amadeu Miguel': [
          { hora: '06:20', obs: '' },
          { hora: '07:15', obs: '' },
          { hora: '07:45', obs: '' },
          { hora: '08:30', obs: '' },
          { hora: '09:10', obs: '' },
          { hora: '09:45', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '11:40', obs: '' },
          { hora: '12:20', obs: '' },
          { hora: '13:05', obs: '' },
          { hora: '13:40', obs: '' },
          { hora: '15:30', obs: '' },
          { hora: '17:30', obs: '' },
          { hora: '19:30', obs: '' }
        ]
      },
      domingos: {
        'Centro': [
          { hora: '05:20', obs: 'Saída Jardim Paraíso/Via C. Jardim/Flora' }
        ],
        'Amadeu Miguel': [
          { hora: '06:20', obs: '' }
        ]
      }
    }
  },
  {
    id: 11,
    numero: '11',
    nome: 'Centro / Colônia Santa Fé',
    via: '',
    cor: '#c0392b',
    directions: ['Centro', 'Colônia Santa Fé'],
    horarios: {
      uteis: {
        'Centro': [
          { hora: '05:50', obs: 'Saída Jardim Paraíso' },
          { hora: '06:15', obs: 'Saída Parque Jussara' },
          { hora: '07:00', obs: '' },
          { hora: '07:10', obs: 'Saída Parque Jussara' },
          { hora: '08:25', obs: '' },
          { hora: '09:35', obs: '' },
          { hora: '10:35', obs: '' },
          { hora: '11:35', obs: '' },
          { hora: '12:35', obs: '' },
          { hora: '13:35', obs: '' },
          { hora: '14:35', obs: '' },
          { hora: '15:35', obs: '' },
          { hora: '16:35', obs: '' },
          { hora: '17:35', obs: '' },
          { hora: '18:35', obs: '' },
          { hora: '19:35', obs: '' }
        ],
        'Colônia Santa Fé': [
          { hora: '06:25', obs: 'Via Tapera' },
          { hora: '06:55', obs: '' },
          { hora: '07:35', obs: '' },
          { hora: '07:50', obs: '' },
          { hora: '09:00', obs: '' },
          { hora: '10:05', obs: '' },
          { hora: '11:05', obs: '' },
          { hora: '12:05', obs: '' },
          { hora: '13:05', obs: '' },
          { hora: '14:05', obs: '' },
          { hora: '15:05', obs: '' },
          { hora: '16:05', obs: '' },
          { hora: '17:05', obs: '' },
          { hora: '18:05', obs: '' },
          { hora: '19:05', obs: '' },
          { hora: '19:55', obs: '' }
        ]
      },
      sabados: {
        'Centro': [
          { hora: '06:20', obs: 'Saída Parque Jussara' },
          { hora: '12:15', obs: 'Saída Parque Jussara' },
          { hora: '15:30', obs: 'Saída Parque Jussara' },
          { hora: '18:00', obs: 'Saída Parque Jussara' }
        ],
        'Colônia Santa Fé': [
          { hora: '06:50', obs: 'Via Parque Jussara' },
          { hora: '12:50', obs: 'Via Parque Jussara' },
          { hora: '16:05', obs: 'Via Parque Jussara' },
          { hora: '19:05', obs: 'Via Parque Jussara' }
        ]
      },
      domingos: {
        'Centro': [
          { hora: '06:20', obs: 'Saída Parque Jussara' },
          { hora: '13:00', obs: 'Saída Parque Jussara' },
          { hora: '17:00', obs: 'Saída Parque Jussara' },
          { hora: '18:00', obs: 'Saída Parque Jussara' }
        ],
        'Colônia Santa Fé': [
          { hora: '06:50', obs: 'Via Parque Jussara' },
          { hora: '13:50', obs: 'Via Parque Jussara' },
          { hora: '17:50', obs: 'Via Parque Jussara' },
          { hora: '19:05', obs: 'Via Parque Jussara' }
        ]
      }
    }
  },
  {
    id: 12,
    numero: '12',
    nome: 'Centro / Flora',
    via: '',
    cor: '#16a085',
    directions: ['Centro', 'Flora'],
    horarios: {
      uteis: {
        'Centro': [
          { hora: '04:50', obs: '' },
          { hora: '06:20', obs: 'Via Cidade Jardim' },
          { hora: '08:00', obs: 'Via Cidade Jardim' },
          { hora: '10:10', obs: 'Via Cidade Jardim' },
          { hora: '12:30', obs: 'Via Cidade Jardim' },
          { hora: '16:10', obs: 'Via Cidade Jardim' },
          { hora: '18:10', obs: 'Via Cidade Jardim' }
        ],
        'Flora': [
          { hora: '05:30', obs: '' },
          { hora: '07:10', obs: '' },
          { hora: '08:50', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '13:20', obs: 'Via Alto da Colina' },
          { hora: '17:10', obs: '' },
          { hora: '19:10', obs: 'Via Alto da Colina' }
        ]
      },
      sabados: {
        'Centro': [
          { hora: '07:00', obs: 'Via Cidade Jardim' },
          { hora: '11:40', obs: 'Via Cidade Jardim' },
          { hora: '16:40', obs: 'Via Cidade Jardim' }
        ],
        'Flora': [
          { hora: '08:00', obs: '' },
          { hora: '12:40', obs: '' },
          { hora: '17:30', obs: '' }
        ]
      },
      domingos: {
        'Centro': [
          { hora: '05:20', obs: 'Saída Jardim Paraíso/Via C. Jardim/A. Miguel' },
          { hora: '08:30', obs: 'Via Cidade Jardim' },
          { hora: '16:30', obs: 'Via Cidade Jardim' }
        ],
        'Flora': [
          { hora: '06:00', obs: 'Via A. Miguel' },
          { hora: '09:20', obs: '' },
          { hora: '17:20', obs: '' }
        ]
      }
    }
  },
  {
    id: 13,
    numero: '13',
    nome: 'Centro / AABB',
    via: '',
    cor: '#27ae60',
    directions: ['Centro', 'AABB'],
    horarios: {
      uteis: {
        'Centro': [
          { hora: '05:45', obs: 'Saída Garagem' },
          { hora: '11:30', obs: 'Saída Praça Matriz' },
          { hora: '17:50', obs: 'Saída Rodoviária' }
        ],
        'AABB': [
          { hora: '06:10', obs: '' },
          { hora: '12:10', obs: '' },
          { hora: '18:20', obs: 'Via Fabiana/Polivalente' }
        ]
      },
      sabados: {},
      domingos: {}
    }
  },
  {
    id: 14,
    numero: '14',
    nome: 'Centro / São Bentinho',
    via: 'Via Califórnia',
    cor: '#8e44ad',
    directions: ['Centro', 'São Bentinho'],
    horarios: {
      uteis: {
        'Centro': [
          { hora: '05:20', obs: 'Saída Garagem' },
          { hora: '11:30', obs: 'Saída Praça Matriz' },
          { hora: '17:05', obs: 'Saída Praça Pelé' }
        ],
        'São Bentinho': [
          { hora: '05:45', obs: '' },
          { hora: '12:10', obs: '' },
          { hora: '18:00', obs: '' }
        ]
      },
      sabados: {},
      domingos: {}
    }
  },
  {
    id: 16,
    numero: '16',
    nome: 'Jardim Paraíso / Amadeu Miguel',
    via: 'Via Contorno',
    cor: '#2980b9',
    directions: ['Jardim Paraíso', 'Amadeu Miguel'],
    horarios: {
      uteis: {
        'Jardim Paraíso': [
          { hora: '05:40', obs: '' },
          { hora: '06:05', obs: '' },
          { hora: '06:30', obs: 'Saída Califórnia' },
          { hora: '06:35', obs: '' },
          { hora: '07:20', obs: '' },
          { hora: '08:00', obs: '' },
          { hora: '09:00', obs: '' },
          { hora: '10:00', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '12:00', obs: '' },
          { hora: '13:00', obs: '' },
          { hora: '14:00', obs: '' },
          { hora: '15:00', obs: '' },
          { hora: '16:00', obs: '' },
          { hora: '17:00', obs: '' },
          { hora: '18:00', obs: '' },
          { hora: '18:10', obs: '' },
          { hora: '19:00', obs: 'Via Centro' },
          { hora: '20:00', obs: 'Via Centro' },
          { hora: '21:00', obs: 'Via Centro' },
          { hora: '22:00', obs: 'Via Centro' }
        ],
        'Amadeu Miguel': [
          { hora: '05:40', obs: 'Saída Nova TC' },
          { hora: '06:30', obs: '' },
          { hora: '07:30', obs: '' },
          { hora: '08:10', obs: '' },
          { hora: '09:00', obs: '' },
          { hora: '10:00', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '12:00', obs: '' },
          { hora: '13:00', obs: '' },
          { hora: '14:00', obs: '' },
          { hora: '15:00', obs: '' },
          { hora: '16:00', obs: '' },
          { hora: '17:00', obs: '' },
          { hora: '18:00', obs: '' },
          { hora: '19:00', obs: '' },
          { hora: '20:00', obs: '' },
          { hora: '21:00', obs: 'Via Centro/Vila Bela II' },
          { hora: '22:00', obs: 'Via Centro/Vila Bela II' },
          { hora: '23:00', obs: '' }
        ]
      },
      sabados: {
        'Jardim Paraíso': [
          { hora: '05:40', obs: '' },
          { hora: '06:10', obs: '' },
          { hora: '06:35', obs: '' },
          { hora: '07:15', obs: '' },
          { hora: '08:00', obs: '' },
          { hora: '09:00', obs: '' },
          { hora: '10:00', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '12:00', obs: '' },
          { hora: '13:00', obs: '' },
          { hora: '14:00', obs: '' },
          { hora: '15:00', obs: '' },
          { hora: '16:00', obs: '' },
          { hora: '17:00', obs: '' },
          { hora: '18:00', obs: '' },
          { hora: '19:00', obs: 'Via Centro' },
          { hora: '20:00', obs: 'Via Centro' },
          { hora: '21:00', obs: 'Via Centro' },
          { hora: '22:00', obs: 'Via Centro' }
        ],
        'Amadeu Miguel': [
          { hora: '06:35', obs: '' },
          { hora: '07:15', obs: '' },
          { hora: '08:00', obs: '' },
          { hora: '09:00', obs: '' },
          { hora: '10:00', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '12:00', obs: '' },
          { hora: '13:00', obs: '' },
          { hora: '14:00', obs: '' },
          { hora: '15:05', obs: '' },
          { hora: '16:05', obs: '' },
          { hora: '17:05', obs: '' },
          { hora: '18:00', obs: '' },
          { hora: '19:00', obs: '' },
          { hora: '20:00', obs: '' },
          { hora: '21:00', obs: 'Via Centro/Via Vila Bela II' },
          { hora: '22:00', obs: 'Via Centro/Via Vila Bela II' },
          { hora: '23:00', obs: '' }
        ]
      },
      domingos: {
        'Jardim Paraíso': [
          { hora: '06:00', obs: '' },
          { hora: '07:00', obs: 'Via Centro' },
          { hora: '08:00', obs: 'Via Centro' },
          { hora: '09:00', obs: 'Via Centro' },
          { hora: '10:00', obs: 'Via Centro' },
          { hora: '11:00', obs: 'Via Centro' },
          { hora: '12:00', obs: '' },
          { hora: '13:00', obs: '' },
          { hora: '14:00', obs: '' },
          { hora: '15:00', obs: '' },
          { hora: '16:00', obs: '' },
          { hora: '17:00', obs: '' },
          { hora: '18:00', obs: '' },
          { hora: '19:00', obs: 'Via Centro' },
          { hora: '20:00', obs: 'Via Centro' },
          { hora: '21:00', obs: 'Via Centro' },
          { hora: '22:00', obs: 'Via Centro' }
        ],
        'Amadeu Miguel': [
          { hora: '06:00', obs: '' },
          { hora: '07:00', obs: 'Via Centro' },
          { hora: '08:00', obs: 'Via Centro' },
          { hora: '09:00', obs: 'Via Centro' },
          { hora: '10:00', obs: 'Via Centro' },
          { hora: '11:00', obs: 'Via Centro' },
          { hora: '12:00', obs: 'Via Centro' },
          { hora: '13:00', obs: '' },
          { hora: '14:00', obs: '' },
          { hora: '15:05', obs: '' },
          { hora: '16:05', obs: '' },
          { hora: '17:05', obs: '' },
          { hora: '18:00', obs: '' },
          { hora: '19:00', obs: '' },
          { hora: '20:00', obs: 'Via Centro' },
          { hora: '21:00', obs: 'Via Centro' },
          { hora: '22:00', obs: 'Via Centro' },
          { hora: '23:00', obs: '' }
        ]
      }
    }
  },
  {
    id: 18,
    numero: '18',
    nome: 'Centro / Campo Alegre',
    via: '',
    cor: '#d35400',
    directions: ['Centro', 'Campo Alegre'],
    horarios: {
      uteis: {
        'Centro': [
          { hora: '06:25', obs: 'Saída Canto do Rio' },
          { hora: '16:20', obs: 'Saída Rodoviária' }
        ],
        'Campo Alegre': [
          { hora: '07:30', obs: '' },
          { hora: '16:55', obs: '' }
        ]
      },
      sabados: {},
      domingos: {}
    }
  },
  {
    id: 20,
    numero: '20',
    nome: 'Belo Horizonte / Monte Verde',
    via: '',
    cor: '#c0392b',
    directions: ['Belo Horizonte', 'Monte Verde'],
    horarios: {
      uteis: {
        'Belo Horizonte': [
          { hora: '05:45', obs: 'Via Tapera/Jardim dos Ypês' },
          { hora: '07:20', obs: 'Via Tapera/Jardim dos Ypês' },
          { hora: '08:50', obs: 'Via Tapera/Jardim dos Ypês' },
          { hora: '11:10', obs: '' },
          { hora: '12:50', obs: 'Via Tapera' },
          { hora: '14:20', obs: 'Via Tapera' },
          { hora: '16:00', obs: 'Via Tapera/Jardim dos Ypês' },
          { hora: '17:40', obs: 'Via Tapera' },
          { hora: '19:20', obs: '' }
        ],
        'Monte Verde': [
          { hora: '06:20', obs: 'Via Polivalente' },
          { hora: '08:05', obs: '' },
          { hora: '09:40', obs: '' },
          { hora: '11:55', obs: 'Via Polivalente/Jardim dos Ypês' },
          { hora: '13:40', obs: '' },
          { hora: '15:10', obs: '' },
          { hora: '16:50', obs: 'Via Jardim dos Ypês/Alterosa' },
          { hora: '18:30', obs: 'Via Polivalente' }
        ]
      },
      sabados: {},
      domingos: {}
    }
  },
  {
    id: 26,
    numero: '26',
    nome: 'Nova Três Corações / Morada do Sol',
    via: '',
    cor: '#7f8c8d',
    directions: ['Nova Três Corações', 'Morada do Sol'],
    horarios: {
      uteis: {
        'Nova Três Corações': [
          { hora: '05:40', obs: '' },
          { hora: '06:00', obs: 'Via Cidade Jardim' },
          { hora: '06:20', obs: 'Via Polivalente' },
          { hora: '07:00', obs: '' },
          { hora: '07:30', obs: 'Via Cidade Jardim' },
          { hora: '08:00', obs: '' },
          { hora: '08:30', obs: '' },
          { hora: '09:00', obs: '' },
          { hora: '09:30', obs: '' },
          { hora: '10:00', obs: '' },
          { hora: '10:30', obs: 'Via Cidade Jardim' },
          { hora: '11:00', obs: '' },
          { hora: '11:30', obs: '' },
          { hora: '12:00', obs: 'Via Polivalente' },
          { hora: '12:30', obs: '' },
          { hora: '13:00', obs: '' },
          { hora: '13:30', obs: '' },
          { hora: '14:00', obs: '' },
          { hora: '14:30', obs: '' },
          { hora: '15:00', obs: '' },
          { hora: '15:30', obs: '' },
          { hora: '16:00', obs: '' },
          { hora: '16:30', obs: '' },
          { hora: '17:00', obs: '' },
          { hora: '17:35', obs: '' },
          { hora: '18:10', obs: 'Via Cidade Jardim' },
          { hora: '18:40', obs: 'Via Polivalente' },
          { hora: '19:15', obs: '' },
          { hora: '19:40', obs: '' },
          { hora: '20:10', obs: '' },
          { hora: '21:00', obs: '' },
          { hora: '21:30', obs: 'Via Mart Minas' },
          { hora: '22:25', obs: '' }
        ],
        'Morada do Sol': [
          { hora: '06:20', obs: '' },
          { hora: '06:45', obs: '' },
          { hora: '07:15', obs: '' },
          { hora: '07:45', obs: '' },
          { hora: '08:15', obs: '' },
          { hora: '08:45', obs: '' },
          { hora: '09:15', obs: '' },
          { hora: '09:45', obs: '' },
          { hora: '10:15', obs: '' },
          { hora: '10:45', obs: '' },
          { hora: '11:15', obs: '' },
          { hora: '11:45', obs: '' },
          { hora: '12:15', obs: '' },
          { hora: '12:45', obs: '' },
          { hora: '13:15', obs: '' },
          { hora: '13:45', obs: '' },
          { hora: '14:15', obs: '' },
          { hora: '14:45', obs: '' },
          { hora: '15:15', obs: '' },
          { hora: '15:45', obs: '' },
          { hora: '16:15', obs: '' },
          { hora: '16:45', obs: '' },
          { hora: '17:20', obs: '' },
          { hora: '17:50', obs: '' },
          { hora: '18:25', obs: '' },
          { hora: '18:55', obs: '' },
          { hora: '19:30', obs: '' },
          { hora: '20:00', obs: '' },
          { hora: '20:20', obs: '' },
          { hora: '20:50', obs: '' },
          { hora: '21:45', obs: '' },
          { hora: '22:25', obs: 'Saída Mart Minas' },
          { hora: '23:05', obs: '' }
        ]
      },
      sabados: {
        'Nova Três Corações': [
          { hora: '05:40', obs: '' },
          { hora: '06:00', obs: '' },
          { hora: '06:20', obs: '' },
          { hora: '07:00', obs: '' },
          { hora: '07:30', obs: '' },
          { hora: '08:00', obs: '' },
          { hora: '08:30', obs: '' },
          { hora: '09:00', obs: '' },
          { hora: '09:30', obs: '' },
          { hora: '10:00', obs: '' },
          { hora: '10:30', obs: '' },
          { hora: '11:00', obs: '' },
          { hora: '11:30', obs: '' },
          { hora: '12:00', obs: '' },
          { hora: '12:30', obs: '' },
          { hora: '13:00', obs: '' },
          { hora: '13:30', obs: '' },
          { hora: '14:00', obs: '' },
          { hora: '14:45', obs: '' },
          { hora: '15:30', obs: '' },
          { hora: '16:15', obs: '' },
          { hora: '17:00', obs: '' },
          { hora: '17:45', obs: '' },
          { hora: '18:30', obs: '' },
          { hora: '19:15', obs: '' },
          { hora: '20:00', obs: '' },
          { hora: '20:45', obs: '' },
          { hora: '21:30', obs: 'Via Mart Minas' },
          { hora: '22:15', obs: '' }
        ],
        'Morada do Sol': [
          { hora: '06:20', obs: '' },
          { hora: '06:45', obs: '' },
          { hora: '07:15', obs: '' },
          { hora: '07:45', obs: '' },
          { hora: '08:15', obs: '' },
          { hora: '08:45', obs: '' },
          { hora: '09:15', obs: '' },
          { hora: '09:45', obs: '' },
          { hora: '10:15', obs: '' },
          { hora: '10:45', obs: '' },
          { hora: '11:15', obs: '' },
          { hora: '11:45', obs: '' },
          { hora: '12:15', obs: '' },
          { hora: '12:45', obs: '' },
          { hora: '13:15', obs: '' },
          { hora: '13:45', obs: '' },
          { hora: '14:15', obs: '' },
          { hora: '14:45', obs: '' },
          { hora: '15:30', obs: '' },
          { hora: '16:15', obs: '' },
          { hora: '17:00', obs: '' },
          { hora: '17:45', obs: '' },
          { hora: '18:30', obs: '' },
          { hora: '19:15', obs: '' },
          { hora: '20:00', obs: '' },
          { hora: '20:45', obs: '' },
          { hora: '21:30', obs: '' },
          { hora: '22:25', obs: 'Via Mart Minas' },
          { hora: '23:05', obs: '' }
        ]
      },
      domingos: {
        'Nova Três Corações': [
          { hora: '06:00', obs: '' },
          { hora: '06:45', obs: '' },
          { hora: '07:30', obs: '' },
          { hora: '08:15', obs: 'Via Contorno' },
          { hora: '09:00', obs: '' },
          { hora: '09:45', obs: '' },
          { hora: '10:30', obs: 'Via Contorno' },
          { hora: '11:15', obs: '' },
          { hora: '12:00', obs: '' },
          { hora: '12:45', obs: 'Via Contorno' },
          { hora: '13:30', obs: '' },
          { hora: '14:15', obs: '' },
          { hora: '15:00', obs: 'Via Contorno' },
          { hora: '15:45', obs: '' },
          { hora: '16:30', obs: '' },
          { hora: '17:15', obs: 'Via Contorno' },
          { hora: '18:00', obs: '' },
          { hora: '18:45', obs: '' },
          { hora: '19:30', obs: '' },
          { hora: '20:15', obs: 'Via Somente até o Centro' },
          { hora: '21:00', obs: 'Via Somente até o Centro' },
          { hora: '22:00', obs: 'Via Somente até o Centro' }
        ],
        'Morada do Sol': [
          { hora: '06:45', obs: '' },
          { hora: '07:30', obs: '' },
          { hora: '08:15', obs: '' },
          { hora: '09:00', obs: 'Via Contorno' },
          { hora: '09:45', obs: '' },
          { hora: '10:30', obs: '' },
          { hora: '11:15', obs: 'Via Contorno' },
          { hora: '12:00', obs: '' },
          { hora: '12:45', obs: '' },
          { hora: '13:30', obs: 'Via Contorno' },
          { hora: '14:15', obs: '' },
          { hora: '15:00', obs: '' },
          { hora: '15:45', obs: 'Via Contorno' },
          { hora: '16:30', obs: '' },
          { hora: '17:15', obs: '' },
          { hora: '18:00', obs: 'Via Contorno' },
          { hora: '18:45', obs: '' },
          { hora: '19:30', obs: '' },
          { hora: '20:15', obs: '' },
          { hora: '21:30', obs: 'Saída Centro' },
          { hora: '22:30', obs: 'Saída Centro' }
        ]
      }
    }
  },
  {
    id: 27,
    numero: '27',
    nome: 'Nova Três Corações / Amadeu Miguel',
    via: '',
    cor: '#95a5a6',
    directions: ['Nova Três Corações', 'Amadeu Miguel'],
    horarios: {
      uteis: {
        'Nova Três Corações': [
          { hora: '05:40', obs: 'Saída Garagem' },
          { hora: '06:35', obs: '' },
          { hora: '07:35', obs: '' },
          { hora: '09:40', obs: '' },
          { hora: '15:00', obs: '' },
          { hora: '16:10', obs: '' },
          { hora: '17:20', obs: '' },
          { hora: '18:30', obs: '' }
        ],
        'Amadeu Miguel': [
          { hora: '15:10', obs: '' },
          { hora: '16:20', obs: '' },
          { hora: '17:30', obs: '' },
          { hora: '18:40', obs: '' }
        ]
      },
      sabados: {
        'Nova Três Corações': [
          { hora: '05:40', obs: 'Saída Garagem' },
          { hora: '06:35', obs: '' },
          { hora: '07:35', obs: '' },
          { hora: '09:40', obs: '' }
        ],
        'Amadeu Miguel': []
      },
      domingos: {}
    }
  },
  {
    id: 28,
    numero: '28',
    nome: 'Alto da Colina / Barreiro',
    via: '',
    cor: '#2c3e50',
    directions: ['Alto da Colina', 'Morada do Lago', 'Barreiro'],
    horarios: {
      uteis: {
        'Alto da Colina': [
          { hora: '06:00', obs: '' },
          { hora: '07:30', obs: 'Saída Rodoviária/Via Contorno/Via Carmo Coffee' },
          { hora: '12:05', obs: 'Via Polivalente/Via Carmo Coffee' },
          { hora: '15:15', obs: '' },
          { hora: '17:30', obs: '' }
        ],
        'Morada do Lago': [
          { hora: '05:50', obs: '' }
        ],
        'Barreiro': [
          { hora: '06:50', obs: '' },
          { hora: '08:20', obs: '' },
          { hora: '13:15', obs: '' },
          { hora: '16:10', obs: '' },
          { hora: '18:30', obs: '' }
        ]
      },
      sabados: {
        'Alto da Colina': [
          { hora: '06:05', obs: '' },
          { hora: '07:40', obs: 'Via Centro/Via Contorno' },
          { hora: '12:15', obs: '' },
          { hora: '15:15', obs: '' },
          { hora: '17:15', obs: '' }
        ],
        'Morada do Lago': [
          { hora: '05:50', obs: '' }
        ],
        'Barreiro': [
          { hora: '06:50', obs: '' },
          { hora: '08:20', obs: '' },
          { hora: '13:00', obs: '' },
          { hora: '16:00', obs: '' },
          { hora: '18:00', obs: '' }
        ]
      },
      domingos: {
        'Alto da Colina': [
          { hora: '06:10', obs: '' },
          { hora: '12:15', obs: '' },
          { hora: '15:15', obs: '' },
          { hora: '17:15', obs: '' }
        ],
        'Morada do Lago': [],
        'Barreiro': [
          { hora: '07:00', obs: '' },
          { hora: '13:00', obs: '' },
          { hora: '16:00', obs: '' },
          { hora: '18:00', obs: '' }
        ]
      }
    }
  }
];

export const getSortedLines = () => {
  return [...busLines].sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
};

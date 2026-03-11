import { Card, Grid, ProgressBar } from 'antd-mobile';
import { HeartOutline } from 'antd-mobile-icons';
import { C } from '../../constants/colors';

export default function RestaurantCard({ restaurant, onClick }) {
  return (
    <Card
      onClick={onClick}
      style={{
        cursor: 'pointer',
        borderRadius: '20px',
        padding: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Grid columns={3} gap={8}>
        <Grid.Item span={1}>
          <img
            src={restaurant.image}
            alt={restaurant.name}
            style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '16px' }}
          />
        </Grid.Item>
        <Grid.Item span={2}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '16px', color: C.textDark }}>{restaurant.name}</strong>
            <HeartOutline style={{ fontSize: '18px', color: C.primaryTint }} />
          </div>
          <div style={{ fontSize: '14px', color: C.textLight, marginTop: '4px' }}>
            {restaurant.cuisine} · {restaurant.priceRange}
          </div>
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: C.primaryDark }}>匹配度</span>
              <span style={{ color: C.primaryDark, fontWeight: '600' }}>{restaurant.matchScore}%</span>
            </div>
            <ProgressBar
              percent={restaurant.matchScore}
              style={{ '--track-width': '6px', '--fill-color': C.primaryLight }}
            />
          </div>
        </Grid.Item>
      </Grid>
    </Card>
  );
}

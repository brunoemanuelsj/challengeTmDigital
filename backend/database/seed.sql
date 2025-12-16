INSERT INTO leads (nome, cpf, email, telefone, status, comentarios) VALUES
('João Silva', '12345678901', 'joao.silva@email.com', '(11) 98765-4321', 'novo', 'Lead interessado em soja'),
('Maria Santos', '98765432109', 'maria.santos@email.com', '(11) 91234-5678', 'contato_inicial', 'Retornar contato na próxima semana'),
('Pedro Oliveira', '45678912345', 'pedro.oliveira@email.com', '(19) 99876-5432', 'em_negociacao', 'Proposta enviada, aguardando retorno'),
('Ana Costa', '78912345678', 'ana.costa@email.com', '(19) 98765-1234', 'convertido', 'Cliente fechado! Iniciar implementação'),
('Carlos Souza', '32165498732', 'carlos.souza@email.com', '(11) 97654-3210', 'perdido', 'Não teve interesse no momento'),
('Fernanda Lima', '65498732165', 'fernanda.lima@email.com', '(16) 99123-4567', 'novo', 'Lead com grande área'),
('Ricardo Alves', '95175385246', 'ricardo.alves@email.com', '(19) 98234-5678', 'contato_inicial', 'Interessado em milho e soja');

-- Inserir propriedades rurais de exemplo
INSERT INTO propriedades_rurais (lead_id, nome, cultura, area_hectares, municipio, estado, geometria) VALUES
-- Propriedade do João Silva (soja, 50 hectares)
((SELECT id FROM leads WHERE cpf = '12345678901'), 'Fazenda São João', 'Soja', 50.00, 'Ribeirão Preto', 'SP', 
    ST_GeomFromText('POLYGON((-47.8 -21.2, -47.8 -21.1, -47.7 -21.1, -47.7 -21.2, -47.8 -21.2))', 4326)),

-- Propriedade da Maria Santos (milho, 75 hectares)
((SELECT id FROM leads WHERE cpf = '98765432109'), 'Sítio Santa Maria', 'Milho', 75.00, 'Campinas', 'SP',
    ST_GeomFromText('POLYGON((-47.1 -22.9, -47.1 -22.8, -47.0 -22.8, -47.0 -22.9, -47.1 -22.9))', 4326)),

-- Propriedade do Pedro Oliveira (café, 120 hectares - PRIORITÁRIO)
((SELECT id FROM leads WHERE cpf = '45678912345'), 'Fazenda Boa Vista', 'Café', 120.00, 'Franca', 'SP',
    ST_GeomFromText('POLYGON((-47.4 -20.5, -47.4 -20.4, -47.3 -20.4, -47.3 -20.5, -47.4 -20.5))', 4326)),

-- Propriedade da Ana Costa (soja e milho, 200 hectares - PRIORITÁRIO)
((SELECT id FROM leads WHERE cpf = '78912345678'), 'Fazenda Três Irmãos', 'Soja e Milho', 200.00, 'Piracicaba', 'SP',
    ST_GeomFromText('POLYGON((-47.7 -22.7, -47.7 -22.6, -47.6 -22.6, -47.6 -22.7, -47.7 -22.7))', 4326)),

-- Propriedade da Fernanda Lima (laranja, 150 hectares - PRIORITÁRIO)
((SELECT id FROM leads WHERE cpf = '65498732165'), 'Fazenda Laranjeiras', 'Laranja', 150.00, 'Araraquara', 'SP',
    ST_GeomFromText('POLYGON((-48.2 -21.8, -48.2 -21.7, -48.1 -21.7, -48.1 -21.8, -48.2 -21.8))', 4326)),

-- Propriedade do Ricardo Alves (soja, 80 hectares)
((SELECT id FROM leads WHERE cpf = '95175385246'), 'Chácara Alvorada', 'Soja', 80.00, 'São Carlos', 'SP',
    ST_GeomFromText('POLYGON((-47.9 -22.0, -47.9 -21.9, -47.8 -21.9, -47.8 -22.0, -47.9 -22.0))', 4326));

-- ========================================
-- VIEW: Dashboard de métricas
-- ========================================
CREATE OR REPLACE VIEW vw_dashboard_metricas AS
SELECT 
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE status = 'novo') as leads_novos,
    COUNT(*) FILTER (WHERE status = 'contato_inicial') as leads_contato_inicial,
    COUNT(*) FILTER (WHERE status = 'em_negociacao') as leads_em_negociacao,
    COUNT(*) FILTER (WHERE status = 'convertido') as leads_convertidos,
    COUNT(*) FILTER (WHERE status = 'perdido') as leads_perdidos
FROM leads;

-- ========================================
-- VIEW: Leads com propriedades prioritárias (> 100 hectares)
-- ========================================
CREATE OR REPLACE VIEW vw_leads_prioritarios AS
SELECT 
    l.id,
    l.nome,
    l.cpf,
    l.email,
    l.telefone,
    l.status,
    COUNT(p.id) as total_propriedades,
    SUM(p.area_hectares) as area_total_hectares,
    MAX(p.area_hectares) as maior_propriedade_hectares
FROM leads l
LEFT JOIN propriedades_rurais p ON p.lead_id = l.id
GROUP BY l.id, l.nome, l.cpf, l.email, l.telefone, l.status
HAVING MAX(p.area_hectares) > 100
ORDER BY MAX(p.area_hectares) DESC;

-- ========================================
-- COMENTÁRIOS (Documentação do banco)
-- ========================================
COMMENT ON TABLE leads IS 'Tabela de leads/prospecções de vendas';
COMMENT ON COLUMN leads.status IS 'Status do lead: novo, contato_inicial, em_negociacao, convertido, perdido';
COMMENT ON TABLE propriedades_rurais IS 'Propriedades rurais associadas aos leads';
COMMENT ON COLUMN propriedades_rurais.geometria IS 'Geometria do polígono da propriedade (PostGIS)';
COMMENT ON COLUMN propriedades_rurais.area_hectares IS 'Área da propriedade em hectares';
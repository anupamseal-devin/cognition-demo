package com.migration.tracker.config;

import com.migration.tracker.entity.*;
import com.migration.tracker.entity.Module;
import com.migration.tracker.entity.enums.*;
import com.migration.tracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ProjectRepository projectRepository;
    private final ModuleRepository moduleRepository;
    private final WaveRepository waveRepository;
    private final BlockerRepository blockerRepository;
    private final RiskRepository riskRepository;
    private final DefectRepository defectRepository;
    private final TestCoverageRepository testCoverageRepository;
    private final DataValidationRepository dataValidationRepository;
    private final CostTrackingRepository costTrackingRepository;
    private final TeamRepository teamRepository;
    private final CutoverChecklistRepository cutoverChecklistRepository;
    private final EscalationRepository escalationRepository;
    private final DependencyRepository dependencyRepository;
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final Random random = new Random(42);

    @Override
    @Transactional
    public void run(String... args) {
        if (projectRepository.count() > 0) return;

        seedUsers();
        Project project = seedProject();
        List<Module> modules = seedModules(project);
        List<Wave> waves = seedWaves(project, modules);
        seedBlockers(modules);
        seedRisks(project);
        seedDefects(modules);
        seedTestCoverage(modules);
        seedDataValidation(modules);
        seedCostTracking(project);
        seedTeams(project);
        seedCutoverChecklists(modules);
        seedEscalations(project);
        seedDependencies(modules);
    }

    private void seedUsers() {
        if (userRepository.existsByUsername("admin")) return;

        userRepository.save(AppUser.builder()
                .username("admin").password(passwordEncoder.encode("admin123"))
                .fullName("System Administrator").role(UserRole.ADMIN).enabled(true).build());
        userRepository.save(AppUser.builder()
                .username("lead").password(passwordEncoder.encode("lead123"))
                .fullName("Priya Sharma").role(UserRole.DELIVERY_LEAD).enabled(true).build());
        userRepository.save(AppUser.builder()
                .username("viewer").password(passwordEncoder.encode("viewer123"))
                .fullName("Client Stakeholder").role(UserRole.VIEWER).enabled(true).build());
    }

    private Project seedProject() {
        return projectRepository.save(Project.builder()
                .name("Global Bank Core Modernization")
                .client("GlobalBank PLC")
                .startDate(LocalDate.of(2025, 4, 1))
                .endDate(LocalDate.of(2026, 3, 31))
                .budget(new BigDecimal("25000000"))
                .status(ProjectStatus.ACTIVE)
                .build());
    }

    private List<Module> seedModules(Project project) {
        List<Module> modules = new ArrayList<>();
        String[][] paymentModules = {
                {"PAY-001", "Payment Gateway Integration"}, {"PAY-002", "SWIFT Messaging Engine"},
                {"PAY-003", "Real-Time Gross Settlement"}, {"PAY-004", "SEPA Credit Transfer"},
                {"PAY-005", "ACH Processing Engine"}, {"PAY-006", "Payment Orchestration Layer"},
                {"PAY-007", "FX Rate Engine"}, {"PAY-008", "Sanctions Screening"},
                {"PAY-009", "Payment Fraud Detection"}, {"PAY-010", "Batch Payment Processor"},
                {"PAY-011", "Payment Status Tracker"}, {"PAY-012", "Nostro Reconciliation"},
                {"PAY-013", "Payment Limits Engine"}, {"PAY-014", "ISO 20022 Adapter"},
                {"PAY-015", "Payment Notification Service"}, {"PAY-016", "Direct Debit Engine"},
                {"PAY-017", "Standing Order Processor"}
        };
        String[][] lendingModules = {
                {"LND-001", "Loan Origination System"}, {"LND-002", "Credit Scoring Engine"},
                {"LND-003", "Collateral Management"}, {"LND-004", "Loan Servicing Platform"},
                {"LND-005", "Collections & Recovery"}, {"LND-006", "Mortgage Processing"},
                {"LND-007", "Interest Calculation Engine"}, {"LND-008", "Covenant Monitoring"},
                {"LND-009", "Syndicated Lending"}, {"LND-010", "Trade Finance Module"},
                {"LND-011", "Letter of Credit"}, {"LND-012", "Loan Portfolio Analytics"},
                {"LND-013", "Provision Calculation"}, {"LND-014", "Loan Document Generation"},
                {"LND-015", "Restructuring & Workout"}, {"LND-016", "SME Lending Platform"}
        };
        String[][] coreBankingModules = {
                {"CB-001", "Customer Master Data"}, {"CB-002", "Account Management"},
                {"CB-003", "General Ledger"}, {"CB-004", "Regulatory Reporting (CCAR/DFAST)"},
                {"CB-005", "Anti-Money Laundering"}, {"CB-006", "KYC/CDD Engine"},
                {"CB-007", "Transaction Processing"}, {"CB-008", "Interest Accrual Engine"},
                {"CB-009", "Fee & Charges Engine"}, {"CB-010", "Statement Generation"},
                {"CB-011", "Tax Reporting (FATCA/CRS)"}, {"CB-012", "Audit Trail System"},
                {"CB-013", "Notification Hub"}, {"CB-014", "Customer Onboarding"},
                {"CB-015", "Product Catalog"}, {"CB-016", "Channel Integration Layer"},
                {"CB-017", "Deposit Processing"}
        };

        String[] owners = {"Priya Sharma", "Raj Patel", "Sarah Chen", "Mike Johnson", "Ana Rodriguez",
                           "James Liu", "Emma Wilson", "David Kim", "Lisa Park", "Tom Harris"};
        ModuleStatus[] statuses = ModuleStatus.values();

        int idx = 0;
        for (String[][] domainModules : new String[][][]{paymentModules, lendingModules, coreBankingModules}) {
            String domain = idx == 0 ? "Payments" : idx == 1 ? "Lending" : "Core Banking";
            for (int i = 0; i < domainModules.length; i++) {
                ModuleStatus st;
                if (i < domainModules.length * 0.2) st = ModuleStatus.DECOMMISSIONED;
                else if (i < domainModules.length * 0.35) st = ModuleStatus.VALIDATED;
                else if (i < domainModules.length * 0.55) st = ModuleStatus.MIGRATED;
                else if (i < domainModules.length * 0.8) st = ModuleStatus.IN_PROGRESS;
                else st = ModuleStatus.NOT_STARTED;

                modules.add(moduleRepository.save(Module.builder()
                        .project(project)
                        .name(domainModules[i][1])
                        .domain(domain)
                        .status(st)
                        .owner(owners[random.nextInt(owners.length)])
                        .priority(random.nextInt(5) + 1)
                        .build()));
            }
            idx++;
        }
        return modules;
    }

    private List<Wave> seedWaves(Project project, List<Module> modules) {
        List<Wave> waves = new ArrayList<>();
        String[][] waveData = {
                {"Wave 1 - Foundation", "2025-04-01", "2025-06-30", "2025-04-01", "2025-07-05"},
                {"Wave 2 - Core Payments", "2025-07-01", "2025-09-30", "2025-07-10", "2025-10-15"},
                {"Wave 3 - Lending & Risk", "2025-10-01", "2025-12-31", "2025-10-20", null},
                {"Wave 4 - Integration", "2026-01-01", "2026-02-28", null, null},
                {"Wave 5 - Cutover & Decom", "2026-03-01", "2026-03-31", null, null}
        };

        int moduleIdx = 0;
        for (int w = 0; w < waveData.length; w++) {
            RagStatus rag;
            if (w == 1) rag = RagStatus.AMBER;
            else if (w == 2) rag = RagStatus.RED;
            else rag = RagStatus.GREEN;

            Wave wave = Wave.builder()
                    .project(project)
                    .name(waveData[w][0])
                    .plannedStartDate(LocalDate.parse(waveData[w][1]))
                    .plannedEndDate(LocalDate.parse(waveData[w][2]))
                    .actualStartDate(waveData[w][3] != null ? LocalDate.parse(waveData[w][3]) : null)
                    .actualEndDate(waveData[w][4] != null ? LocalDate.parse(waveData[w][4]) : null)
                    .ragStatus(rag)
                    .modules(new ArrayList<>())
                    .build();

            int modulesPerWave = modules.size() / waveData.length;
            for (int i = 0; i < modulesPerWave && moduleIdx < modules.size(); i++, moduleIdx++) {
                wave.getModules().add(modules.get(moduleIdx));
            }
            if (w == waveData.length - 1) {
                while (moduleIdx < modules.size()) {
                    wave.getModules().add(modules.get(moduleIdx++));
                }
            }
            waves.add(waveRepository.save(wave));
        }
        return waves;
    }

    private void seedBlockers(List<Module> modules) {
        BlockerCategory[] cats = BlockerCategory.values();
        String[][] blockerData = {
                {"TECHNICAL", "Legacy COBOL copybook parsing failing for nested structures", "Raj Patel", "OPEN"},
                {"REGULATORY", "Basel III compliance sign-off pending from risk committee", "Priya Sharma", "OPEN"},
                {"DATA", "Data reconciliation mismatch in GL posting for FY2024 transactions", "Sarah Chen", "OPEN"},
                {"VENDOR", "IBM MQ license renewal delayed - impacts message queue migration", "Mike Johnson", "OPEN"},
                {"ENVIRONMENT", "UAT environment not provisioned - Azure subscription approval pending", "Ana Rodriguez", "OPEN"},
                {"TECHNICAL", "CICS transaction mapping incomplete for real-time payment flows", "James Liu", "OPEN"},
                {"DATA", "Historical data migration script OOM on datasets > 10M records", "Emma Wilson", "RESOLVED"},
                {"REGULATORY", "PCI-DSS re-certification required before payment gateway go-live", "David Kim", "OPEN"},
                {"TECHNICAL", "JCL to Spring Batch conversion failing for multi-step jobs", "Lisa Park", "RESOLVED"},
                {"VENDOR", "Oracle DB licensing dispute blocking test environment setup", "Tom Harris", "OPEN"},
                {"ENVIRONMENT", "Production firewall rules not configured for new microservices", "Raj Patel", "OPEN"},
                {"TECHNICAL", "VSAM to PostgreSQL data type mapping issues with packed decimal", "Sarah Chen", "OPEN"},
                {"DATA", "Customer PII data masking not working for non-Latin character sets", "Mike Johnson", "RESOLVED"},
                {"REGULATORY", "GDPR data retention policy conflicts with legacy archive strategy", "Priya Sharma", "OPEN"},
                {"TECHNICAL", "Mainframe screen scraping brittle - IMS DC transaction timeouts", "James Liu", "OPEN"},
                {"VENDOR", "Temenos integration API documentation incomplete", "Ana Rodriguez", "OPEN"},
                {"ENVIRONMENT", "Network latency between on-prem and cloud exceeds SLA", "Emma Wilson", "OPEN"},
                {"DATA", "Loan amortization schedule recalculation discrepancies", "David Kim", "OPEN"},
                {"TECHNICAL", "Batch window conflict - legacy job scheduler overlaps with new CDC pipeline", "Lisa Park", "OPEN"},
                {"REGULATORY", "SOX audit trail requirements not met in new event sourcing architecture", "Tom Harris", "OPEN"}
        };

        for (int i = 0; i < blockerData.length; i++) {
            Module module = modules.get(random.nextInt(modules.size()));
            blockerRepository.save(Blocker.builder()
                    .module(module)
                    .category(BlockerCategory.valueOf(blockerData[i][0]))
                    .description(blockerData[i][1])
                    .owner(blockerData[i][2])
                    .status(blockerData[i][3])
                    .createdDate(LocalDate.now().minusDays(random.nextInt(90) + 5))
                    .resolvedDate("RESOLVED".equals(blockerData[i][3]) ? LocalDate.now().minusDays(random.nextInt(10)) : null)
                    .build());
        }
    }

    private void seedRisks(Project project) {
        String[][] riskData = {
                {"CRITICAL", "Mainframe decommission deadline may slip due to regulatory hold", "Negotiate extension with regulator; parallel run contingency", "Priya Sharma", "OPEN"},
                {"HIGH", "Key COBOL SME retiring in Q3 - critical knowledge transfer at risk", "Accelerate knowledge capture sessions; hire contractor backup", "Raj Patel", "OPEN"},
                {"HIGH", "Cloud cost overrun due to unexpected data egress charges", "Implement FinOps controls; negotiate reserved capacity", "Sarah Chen", "OPEN"},
                {"CRITICAL", "Vendor contract dispute may block UAT environment access", "Legal escalation in progress; prepare fallback environment", "Mike Johnson", "OPEN"},
                {"MEDIUM", "Team attrition rate higher than planned (15% vs 8%)", "Retention bonuses approved; backfill pipeline active", "Ana Rodriguez", "OPEN"},
                {"HIGH", "Data quality issues in legacy system may propagate to new platform", "Implement data profiling and cleansing pipeline", "James Liu", "OPEN"},
                {"MEDIUM", "Integration testing timeline compressed due to Wave 2 delays", "Add weekend testing sprints; automate regression suite", "Emma Wilson", "MITIGATED"},
                {"LOW", "New regulatory requirement (DORA) may require architecture changes", "Architecture review scheduled for next month", "David Kim", "OPEN"},
                {"HIGH", "Performance benchmarks not met for real-time payment processing", "Optimize DB queries; consider caching layer", "Lisa Park", "OPEN"},
                {"MEDIUM", "Client SME availability limited during holiday season", "Front-load client-dependent activities; get proxy approvals", "Tom Harris", "OPEN"}
        };

        for (String[] r : riskData) {
            riskRepository.save(Risk.builder()
                    .project(project)
                    .severity(Severity.valueOf(r[0]))
                    .description(r[1])
                    .mitigation(r[2])
                    .owner(r[3])
                    .status(r[4])
                    .build());
        }
    }

    private void seedDefects(List<Module> modules) {
        String[] phases = {"Unit Testing", "Integration Testing", "UAT", "Performance Testing", "Migration Validation"};
        String[] defectStatuses = {"OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"};
        Severity[] severities = Severity.values();

        String[] defectDescriptions = {
                "Null pointer exception in transaction rollback handler",
                "Incorrect interest calculation for variable rate loans",
                "Payment status not updating after SWIFT acknowledgement",
                "Memory leak in batch processing of large customer datasets",
                "Race condition in concurrent payment authorization",
                "Incorrect GL posting for multi-currency transactions",
                "Timeout in KYC verification service under load",
                "Data truncation in customer name field (Unicode support)",
                "Incorrect fee calculation for tiered pricing",
                "Statement generation fails for accounts with 10K+ transactions",
                "Missing audit trail entries for bulk status updates",
                "Incorrect rounding in FX conversion calculations",
                "SSL certificate validation bypassed in test mode",
                "Deadlock in concurrent loan approval workflow",
                "Incorrect date handling for leap year calculations",
                "Payment duplicate detection false positives",
                "Incorrect IBAN validation for new EU member states",
                "Batch job recovery fails after mid-process crash",
                "Incorrect tax withholding calculation for NRI accounts",
                "API rate limiting not enforced for internal services",
                "Collateral valuation discrepancy after market data feed update",
                "Standing order execution missed for DST transition dates",
                "Regulatory report aggregation error for cross-border transactions",
                "Customer notification sent with incorrect transaction amount",
                "Loan prepayment penalty calculation uses wrong base date"
        };

        for (int i = 0; i < defectDescriptions.length; i++) {
            defectRepository.save(Defect.builder()
                    .module(modules.get(random.nextInt(modules.size())))
                    .severity(severities[random.nextInt(severities.length)])
                    .description(defectDescriptions[i])
                    .status(defectStatuses[random.nextInt(defectStatuses.length)])
                    .foundInPhase(phases[random.nextInt(phases.length)])
                    .createdDate(LocalDate.now().minusDays(random.nextInt(120)))
                    .build());
        }
    }

    private void seedTestCoverage(List<Module> modules) {
        for (Module m : modules) {
            double legacyCov = 40 + random.nextDouble() * 40;
            double newCov;
            switch (m.getStatus()) {
                case DECOMMISSIONED: case VALIDATED: newCov = 85 + random.nextDouble() * 15; break;
                case MIGRATED: newCov = 70 + random.nextDouble() * 20; break;
                case IN_PROGRESS: newCov = 30 + random.nextDouble() * 40; break;
                default: newCov = random.nextDouble() * 20; break;
            }
            double regPass;
            if (m.getStatus() == ModuleStatus.VALIDATED || m.getStatus() == ModuleStatus.DECOMMISSIONED) {
                regPass = 95 + random.nextDouble() * 5;
            } else {
                regPass = 60 + random.nextDouble() * 35;
            }

            testCoverageRepository.save(TestCoverage.builder()
                    .module(m)
                    .legacyCoveragePercent(Math.round(legacyCov * 100.0) / 100.0)
                    .newCoveragePercent(Math.round(newCov * 100.0) / 100.0)
                    .regressionPassRatePercent(Math.round(regPass * 100.0) / 100.0)
                    .build());
        }
    }

    private void seedDataValidation(List<Module> modules) {
        for (Module m : modules) {
            long records = (long)(random.nextInt(500000) + 10000);
            long mismatches;
            String reconStatus;
            if (m.getStatus() == ModuleStatus.VALIDATED || m.getStatus() == ModuleStatus.DECOMMISSIONED) {
                mismatches = 0;
                reconStatus = "PASSED";
            } else if (m.getStatus() == ModuleStatus.MIGRATED) {
                mismatches = random.nextInt(50);
                reconStatus = mismatches == 0 ? "PASSED" : "IN_PROGRESS";
            } else {
                mismatches = random.nextInt(5000) + 100;
                reconStatus = "PENDING";
            }

            dataValidationRepository.save(DataValidation.builder()
                    .module(m)
                    .reconciliationStatus(reconStatus)
                    .recordsCompared(records)
                    .mismatchCount(mismatches)
                    .build());
        }
    }

    private void seedCostTracking(Project project) {
        String[] months = {"2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09",
                           "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03"};
        double[] plannedBudgets = {1800000, 1900000, 2000000, 2200000, 2300000, 2100000,
                                    2200000, 2100000, 2000000, 2100000, 2200000, 2100000};
        double[] actualBudgets = {1750000, 1950000, 2100000, 2350000, 2450000, 2250000,
                                   2400000, 2300000, 0, 0, 0, 0};
        int[] hcPlanned = {85, 90, 95, 100, 105, 100, 100, 95, 90, 90, 85, 80};
        int[] hcActual = {82, 88, 92, 98, 102, 96, 94, 0, 0, 0, 0, 0};

        for (int i = 0; i < months.length; i++) {
            costTrackingRepository.save(CostTracking.builder()
                    .project(project)
                    .month(months[i])
                    .budgetPlanned(BigDecimal.valueOf(plannedBudgets[i]))
                    .budgetActual(BigDecimal.valueOf(actualBudgets[i]))
                    .headcountPlanned(hcPlanned[i])
                    .headcountActual(hcActual[i])
                    .build());
        }
    }

    private void seedTeams(Project project) {
        String[][] teamData = {
                {"Payments Squad Alpha", "32", "12"},
                {"Payments Squad Beta", "28", "10"},
                {"Lending Squad", "35", "15"},
                {"Core Banking Squad", "30", "14"},
                {"Integration Squad", "25", "8"},
                {"Data Migration Squad", "38", "10"},
                {"QA & Validation Squad", "22", "12"},
                {"DevOps & Infra Squad", "18", "6"}
        };

        for (String[] t : teamData) {
            teamRepository.save(Team.builder()
                    .project(project)
                    .name(t[0])
                    .velocity(Double.parseDouble(t[1]))
                    .allocatedHeadcount(Integer.parseInt(t[2]))
                    .build());
        }
    }

    private void seedCutoverChecklists(List<Module> modules) {
        String[] items = {
                "Data migration verified", "Rollback script tested", "Performance benchmarks met",
                "Security scan passed", "DR/failover tested", "Runbook documented",
                "Monitoring alerts configured", "Client sign-off obtained"
        };

        for (Module m : modules) {
            for (String item : items) {
                boolean completed;
                boolean rollbackTested;
                switch (m.getStatus()) {
                    case DECOMMISSIONED: completed = true; rollbackTested = true; break;
                    case VALIDATED: completed = random.nextDouble() > 0.1; rollbackTested = random.nextDouble() > 0.2; break;
                    case MIGRATED: completed = random.nextDouble() > 0.3; rollbackTested = random.nextDouble() > 0.4; break;
                    case IN_PROGRESS: completed = random.nextDouble() > 0.6; rollbackTested = random.nextDouble() > 0.7; break;
                    default: completed = false; rollbackTested = false; break;
                }

                cutoverChecklistRepository.save(CutoverChecklist.builder()
                        .module(m)
                        .item(item)
                        .completed(completed)
                        .rollbackTested(rollbackTested)
                        .build());
            }
        }
    }

    private void seedEscalations(Project project) {
        String[][] escData = {
                {"UAT environment not available - blocking Wave 2 testing", "2025-08-15", null, "true"},
                {"Client SME unavailable for 3 weeks - payments domain blocked", "2025-09-01", null, "true"},
                {"Vendor SLA breach - middleware response times exceed 500ms", "2025-09-20", "2025-10-05", "false"},
                {"Production access credentials not provisioned by client IT", "2025-10-10", null, "true"},
                {"Regulatory change request requires re-architecture of AML module", "2025-10-25", null, "false"},
                {"Network connectivity issues between cloud and on-premises DC", "2025-11-05", "2025-11-20", "false"},
                {"Budget reforecast approval delayed by client finance team", "2025-11-15", null, "true"},
                {"Data center migration coincides with our go-live window", "2025-12-01", null, "false"}
        };

        for (String[] e : escData) {
            escalationRepository.save(Escalation.builder()
                    .project(project)
                    .description(e[0])
                    .raisedDate(LocalDate.parse(e[1]))
                    .resolvedDate(e[2] != null ? LocalDate.parse(e[2]) : null)
                    .slaBreached(Boolean.parseBoolean(e[3]))
                    .build());
        }
    }

    private void seedDependencies(List<Module> modules) {
        // Create realistic dependencies between modules
        Map<String, List<Module>> byDomain = new HashMap<>();
        for (Module m : modules) {
            byDomain.computeIfAbsent(m.getDomain(), k -> new ArrayList<>()).add(m);
        }

        // Within Payments - sequential processing chain
        List<Module> payments = byDomain.getOrDefault("Payments", List.of());
        for (int i = 1; i < Math.min(payments.size(), 6); i++) {
            dependencyRepository.save(Dependency.builder()
                    .fromModule(payments.get(i - 1)).toModule(payments.get(i))
                    .type(DependencyType.BLOCKS).build());
        }

        // Lending depends on some payment modules
        List<Module> lending = byDomain.getOrDefault("Lending", List.of());
        if (!payments.isEmpty() && !lending.isEmpty()) {
            dependencyRepository.save(Dependency.builder()
                    .fromModule(payments.get(0)).toModule(lending.get(0))
                    .type(DependencyType.DEPENDS_ON).build());
            if (payments.size() > 2 && lending.size() > 3) {
                dependencyRepository.save(Dependency.builder()
                        .fromModule(payments.get(2)).toModule(lending.get(3))
                        .type(DependencyType.DEPENDS_ON).build());
            }
        }

        // Core Banking is foundational
        List<Module> coreBanking = byDomain.getOrDefault("Core Banking", List.of());
        if (!coreBanking.isEmpty()) {
            // Customer Master and Account Management are foundational
            for (int i = 2; i < Math.min(coreBanking.size(), 8); i++) {
                dependencyRepository.save(Dependency.builder()
                        .fromModule(coreBanking.get(0)).toModule(coreBanking.get(i))
                        .type(DependencyType.BLOCKS).build());
            }
            // GL depends on Account Mgmt
            if (coreBanking.size() > 2) {
                dependencyRepository.save(Dependency.builder()
                        .fromModule(coreBanking.get(1)).toModule(coreBanking.get(2))
                        .type(DependencyType.BLOCKS).build());
            }
            // Cross-domain dependencies
            if (!payments.isEmpty()) {
                dependencyRepository.save(Dependency.builder()
                        .fromModule(coreBanking.get(0)).toModule(payments.get(0))
                        .type(DependencyType.BLOCKS).build());
            }
            if (!lending.isEmpty()) {
                dependencyRepository.save(Dependency.builder()
                        .fromModule(coreBanking.get(0)).toModule(lending.get(0))
                        .type(DependencyType.BLOCKS).build());
                dependencyRepository.save(Dependency.builder()
                        .fromModule(coreBanking.get(1)).toModule(lending.get(1))
                        .type(DependencyType.BLOCKS).build());
            }
        }
    }
}
